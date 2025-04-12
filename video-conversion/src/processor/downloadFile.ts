import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { API_GATEWAY_EVENTS } from '../constant/events';
import { IVideoMetadata } from '../interface/common';
import { logger } from '../shared/logger';
import { removeMetadata, waitForMetadata } from '../shared/metadataStore';
import RabbitMQ from '../shared/rabbitMQ';
import s3 from '../shared/s3Client';
import initiateVideoProcessing from './initiateVideoProcessing';

// Debug logs
console.log("DO Spaces Config:", {
  endpoint: config.doSpaces.endpoint,
  accessKey: config.doSpaces.accessKey ? "EXISTS" : "MISSING",
  secretKey: config.doSpaces.secretKey ? "EXISTS" : "MISSING",
  region: config.doSpaces.region,
  bucketName: config.doSpaces.bucketName
});

// Download file from DO Spaces
async function downloadBlob(
  bucketName: string,
  fileKey: string,
  fileName:string,
  userId: string
) {
  const uploadFolder = `container-${uuidv4()}`;
  const destinationDir = path
      .normalize(path.join('uploads', uploadFolder, 'videos'))
      .replace(/\\/g, '/');
  const videoPath = path
      .normalize(path.join(destinationDir, path.basename(fileName)))
      .replace(/\\/g, '/');

  try {
    logger.info(`Starting download: bucketName=${bucketName}, fileName=${fileName}, userId=${userId}`);
    const originalName = fileName.substring(fileName.indexOf('-') + 1);

    // Notify about download start
    RabbitMQ.sendToQueue(API_GATEWAY_EVENTS.NOTIFY_VIDEO_DOWNLOADING, {
      userId,
      status: 'processing',
      name: 'Video Downloading from Storage',
      fileName: fileName,
      originalName: originalName,
      message: 'Video is downloading from Digital Ocean Spaces',
    });

    // Ensure destination directory exists
    await fs.promises.mkdir(destinationDir, { recursive: true });
    logger.info(`Created download directory: ${destinationDir}`);

    logger.info(`Downloading file from DO Spaces to ${videoPath}`);

    // Download the file using promises for cleaner async handling
    await new Promise<void>((resolve, reject) => {
      const writeStream = fs.createWriteStream(videoPath);
      s3.getObject({
        Bucket: bucketName,
        Key: fileKey
      })
      .createReadStream()
      .on('error', (err) => {
        console.error('Error piping stream from S3:', err);
        writeStream.destroy();
        reject(err);
      })
      .pipe(writeStream)
      .on('error', (err) => {
        console.error(`Error writing file ${videoPath} to disk:`, err);
        reject(err);
      })
      .on('finish', () => {
        logger.info(`Successfully downloaded file to ${videoPath}`);
        resolve();
      });
    });

    // Notify about download completion
    RabbitMQ.sendToQueue(API_GATEWAY_EVENTS.NOTIFY_VIDEO_DOWNLOADING, {
      userId,
      status: 'completed',
      name: 'Video Download Complete',
      fileName: fileName,
      message: 'Video successfully downloaded from Digital Ocean Spaces',
    });

    // --- Add log before waiting --- 
    logger.info(`[downloadBlob] Download complete. Preparing to wait for metadata for fileName: ${fileName}`);

    let videoMetadata: IVideoMetadata;
    try {
        // --- Add log right before the await --- 
        logger.info(`[downloadBlob] Calling waitForMetadata for fileName: ${fileName}`);
        videoMetadata = await waitForMetadata(fileName, 60000);
        // --- Add log right after the await completes successfully --- 
        logger.info(`[downloadBlob] Successfully received metadata for fileName: ${fileName}. Proceeding to process.`);
        // Original log kept for context if needed
        // logger.info(`Metadata received for fileKey: ${fileName}`);
    } catch (metadataError) {
        // --- Add log if waitForMetadata fails --- 
        logger.error(`[downloadBlob] Error waiting for metadata for fileName ${fileName}:`, metadataError);
        console.error(`Failed to get metadata for ${fileName}:`, metadataError); // Keep console for visibility
        RabbitMQ.sendToQueue(API_GATEWAY_EVENTS.NOTIFY_EVENTS_FAILED, {
          userId,
          status: 'failed',
          name: 'Metadata Retrieval',
          message: `Failed to retrieve metadata for video ${fileName}. Processing cannot continue.`, 
          fileName: fileName,
        });
        try {
            logger.warn(`Cleaning up downloaded file due to metadata failure: ${videoPath}`);
            await fs.promises.unlink(videoPath);
            await fs.promises.rmdir(destinationDir).catch(() => {});
        } catch (cleanupError) {
            console.error(`Error cleaning up file ${videoPath} after metadata failure:`, cleanupError);
        }
        throw metadataError;
    }

    // --- Add log before initiating processing --- 
    logger.info(`[downloadBlob] Preparing to initiate video processing for fileName: ${fileName}`);
    // Original log kept for context
    // logger.info('Starting video processing for file at: ' + videoPath);

    await initiateVideoProcessing({
      videoPath,
      destination: destinationDir,
      userId,
      videoMetadata,
    });

    return true;
  } catch (error) {
    console.error(`Error in downloadBlob process for fileKey ${fileName}:`, error);

    // Robust check for the error type and message before accessing .includes
    let isMetadataError = false;
    if (error instanceof Error && typeof error.message === 'string') {
        isMetadataError = error.message.includes('Metadata for fileKey');
    }

    // Send notification only if it wasn't the specific metadata error we already handled
    if (!isMetadataError) {
        RabbitMQ.sendToQueue(API_GATEWAY_EVENTS.NOTIFY_EVENTS_FAILED, {
            userId,
            status: 'failed',
            name: 'Video Download/Processing',
            message: `An error occurred during the download or processing of ${path.basename(fileName)}: ${error.message}`,
            fileName: path.basename(fileName),
        });
    }

    try {
        if (fs.existsSync(videoPath)) {
            logger.warn(`Cleaning up downloaded file due to error: ${videoPath}`);
            await fs.promises.unlink(videoPath);
            await fs.promises.rmdir(destinationDir).catch(() => {});
        }
    } catch (cleanupError) {
        console.error(`Error during cleanup for file ${videoPath}:`, cleanupError);
    }
    removeMetadata(fileName);

    throw error;
  }
}

export default downloadBlob;
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { API_GATEWAY_EVENTS, API_SERVER_EVENTS } from '../constant/events';
import { IVideoMetadata } from '../interface/common';
import eventManager from '../shared/event-manager';
import { errorLogger, logger } from '../shared/logger';
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

// Get video metadata from API server
const getVideoMetadata = async ()=> {
  await RabbitMQ.consume(
    API_SERVER_EVENTS.GET_VIDEO_METADATA_EVENT,
    (msg, ack) => {
      const data = JSON.parse(msg.content.toString());
      console.log('Received video metadata: from api server, passing for download', data);
      eventManager.emit('videoMetadata', data);
      ack();
    },
  );
};

// Download file from DO Spaces
async function downloadBlob(
  bucketName: string,
  fileKey: string,
  userId: string
) {
  try {
    logger.info(`Starting download: bucketName=${bucketName}, fileKey=${fileKey}, userId=${userId}`);
    // Get the original filename and the new filename with timestamp
const fileName = path.basename(fileKey);  // With timestamp

// Extract just the original name from the filename
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

    // Get video metadata (optional - you may want to remove if not needed)
    await getVideoMetadata();
    let videoMetadata = {} as IVideoMetadata;

    // Add timeout to prevent hanging if metadata never arrives
    await new Promise<void>((resolve) => {
      const metadataTimeout = setTimeout(() => {
        logger.warn(`No metadata received after 5 seconds for file ${fileName}, continuing without it`);
        resolve();
      }, 5000);

      eventManager.once('videoMetadata', (data) => {
        clearTimeout(metadataTimeout);
        videoMetadata = data;
        resolve();
      });
    });

    // Create unique folder for this download
    const uploadFolder = `container-${uuidv4()}`;
    const destination = path
      .normalize(path.join('uploads', uploadFolder, 'videos'))
      .replace(/\\/g, '/');
    
    // Create destination directory
    fs.mkdirSync(destination, { recursive: true });
    

    const videoPath = path
      .normalize(path.join(destination, fileName))
      .replace(/\\/g, '/');
    
    logger.info(`Downloading file from DO Spaces to ${videoPath}`);
    
    // Download the file
    await new Promise<void>((resolve, reject) => {
      console.log('videoPath', videoPath);
      const writeStream = fs.createWriteStream(videoPath);

      console.log('bucketName', bucketName);
      console.log('fileKey', fileKey);
      
      s3.getObject({
        Bucket: bucketName,
        Key: fileKey
      })
      .createReadStream()
      .pipe(writeStream)
      .on('error', (err) => {
        console.log('Error downloading from DO Spaces:', err);
        reject(err);
      })
      .on('finish', () => {
        console.log(`Successfully downloaded file to ${videoPath}`);
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

    console.log('Starting video processing for file at: ' + videoPath);
    
    // Process the video
    await initiateVideoProcessing({
      videoPath,
      destination,
      userId,
      videoMetadata,
    });
    
    return true;
  } catch (error) {
    errorLogger.error('Error in downloadBlob:', error);
    
    RabbitMQ.sendToQueue(API_GATEWAY_EVENTS.NOTIFY_EVENTS_FAILED, {
      userId,
      status: 'failed',
      name: 'Video Download',
      message: 'Failed to download video from Digital Ocean Spaces',
      fileName: path.basename(fileKey),
    });
    
    throw error;
  }
}

export default downloadBlob;
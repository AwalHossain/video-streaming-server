/* eslint-disable @typescript-eslint/no-explicit-any */
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import config from '../config';
import { API_GATEWAY_EVENTS, API_SERVER_EVENTS, QUEUE_EVENTS } from '../constant/events';
import { addQueueItem } from '../queues/addJobToQueue';
import { errorLogger } from '../shared/logger';
import RabbitMQ from '../shared/rabbitMQ';
import s3, { getCdnUrl, getUserFolder } from '../shared/s3Client';

ffmpeg.setFfmpegPath(ffmpegPath);

interface JobData {
  completed: boolean;
  path: string;
  destination: string;
  userId: string;
  fileName: string;
  folderName: string;
  next: string;
  id?: string;
}

interface ProcessedFile {
  fileName: string;
  outputFileName: string;
}

const processRawFileToMp4WithWatermark = async (
  filePath: string,
  outputFolder: string,
  jobData: JobData,
) => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);

  console.log(
    fileExt,
    'fileExt',
    fileNameWithoutExt,
    'fileNameWithoutExt of checking after gettign into process(2)',
  );

  const outputFileName = `${outputFolder}/${fileNameWithoutExt}.mp4`;

  const ffmpegCommand = ffmpeg(filePath).output(outputFileName);

  let lastReportedProgress = 0;
  return new Promise((resolve, reject) => {
    ffmpegCommand
      .on('start', function (commandLine: string) {
        console.log('Spawned Ffmpeg with command: ' + commandLine);

        const videoProcessingData = {
          userId: jobData.userId,
          status: 'processing',
          name: 'Video mp4',
          fileName: fileNameWithoutExt,
          progress: 1,
          message: 'Video conveting to mp4 Processing',
        };

        RabbitMQ.sendToQueue(
          API_GATEWAY_EVENTS.NOTIFY_VIDEO_PROCESSING,
          videoProcessingData,
        );
      })
      .on('progress', function (progress: any) {
        if (progress.percent - lastReportedProgress >= 10) {
          lastReportedProgress = progress.percent;
          console.log(
            jobData.fileName,
            ' is Processing: ' + progress.percent + '% done',
          );

          const videoProgressingData = {
            userId: jobData.userId,
            status: 'processing',
            name: 'Video mp4',
            fileName: fileNameWithoutExt,
            progress: lastReportedProgress,
            message: 'Video conveting to mp4 Processing',
          };
          RabbitMQ.sendToQueue(
            API_GATEWAY_EVENTS.NOTIFY_VIDEO_PROCESSING,
            videoProgressingData,
          );
        }
      })
      .on('end', async function () {
        const videoProcessedData = {
          userId: jobData.userId,
          status: 'completed',
          name: 'Video mp4',
          progress: 100,
          fileName: fileNameWithoutExt,
          message: 'Video converting to mp4 Processing is done',
        };

        RabbitMQ.sendToQueue(
          API_GATEWAY_EVENTS.NOTIFY_VIDEO_PROCESSING,
          videoProcessedData,
        );

        const videoCompletedData = {
          userId: jobData.userId,
          status: 'success',
          name: 'Video mp4',
          fileName: fileNameWithoutExt,
          message: 'Video Processed',
        };

        RabbitMQ.sendToQueue(
          API_GATEWAY_EVENTS.NOTIFY_VIDEO_PROCESSED,
          videoCompletedData,
        );

        await addQueueItem(QUEUE_EVENTS.VIDEO_PROCESSED, {
          ...jobData,
          completed: true,
          path: outputFileName,
        });

        console.log(jobData.fileName, 'Processing finished !', jobData);

        resolve(outputFileName);
      })
      .on('error', function (err: Error) {
        const videoFailedData = {
          userId: jobData.userId,
          status: 'failed',
          name: 'Video Mp4 Processing',
          progress: 0,
          fileName: fileNameWithoutExt,
          message: 'Video Processed failed',
        };

        RabbitMQ.sendToQueue(
          API_GATEWAY_EVENTS.NOTIFY_VIDEO_PROCESSING,
          videoFailedData,
        );
        errorLogger.log('An error occurred: ', err.message);
        reject(err);
      })
      .run();

    const folderName = jobData.destination.split('/')[1];
    const uploadPath = `uploads/${folderName}/thumbnails`;
    fs.mkdirSync(uploadPath, { recursive: true });

    generateThumbnail(filePath, uploadPath, {
      ...jobData,
      completed: true,
    });

    return;
  });
};

const generateThumbnail = async (
  filePath: string,
  outputFolder: string,
  jobData: JobData,
): Promise<ProcessedFile> => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);
  const thumbnailFileName = `${fileNameWithoutExt}.png`;
  const thumbnailFilePath = `${outputFolder}/${thumbnailFileName}`;
  console.log(thumbnailFileName, 'thumbnailFileName');

  // Define a properly typed result to return
  const result: ProcessedFile = {
    fileName: fileNameWithoutExt,
    outputFileName: thumbnailFilePath
  };

  // Get video dimensions first to maintain aspect ratio
  try {
    // Dynamic import to avoid circular dependency
    const videoHandler = await import('./videoProcessingHandler');
    const { videoResolution } = await videoHandler.getVideoDurationAndResolution(filePath);

    // Validate dimensions to avoid NaN errors
    if (!videoResolution.width || !videoResolution.height ||
      isNaN(videoResolution.width) || isNaN(videoResolution.height)) {
      throw new Error(`Invalid video dimensions: ${videoResolution.width}x${videoResolution.height}`);
    }

    // Calculate thumbnail size while preserving aspect ratio
    // Use max width/height of 640px but keep aspect ratio
    let thumbnailWidth, thumbnailHeight;
    const MAX_DIMENSION = 640;

    if (videoResolution.width > videoResolution.height) {
      // Horizontal video
      thumbnailWidth = Math.min(MAX_DIMENSION, videoResolution.width);
      thumbnailHeight = Math.round((thumbnailWidth / videoResolution.width) * videoResolution.height);
    } else {
      // Vertical video
      thumbnailHeight = Math.min(MAX_DIMENSION, videoResolution.height);
      thumbnailWidth = Math.round((thumbnailHeight / videoResolution.height) * videoResolution.width);
    }

    const thumbnailSize = `${thumbnailWidth}x${thumbnailHeight}`;
    console.log(`Creating thumbnail with size ${thumbnailSize} to preserve aspect ratio`);

    // Create a Promise for the ffmpeg operation
    await new Promise<void>((resolve, reject) => {
      ffmpeg(filePath)
        .screenshots({
          timestamps: ['00:01'],
          filename: thumbnailFileName,
          folder: `${outputFolder}`,
          size: thumbnailSize,
        })
        .on('end', async function () {
          console.log(jobData.fileName, 'thumbnail generated!', jobData.path);

          // Upload thumbnail immediately to cloud storage
          try {
            const videoId = jobData.id || `video-${Date.now()}`;
            const userFolder = getUserFolder(jobData.userId, videoId);
            const key = `${userFolder}/${thumbnailFileName}`;

            // Read the thumbnail file
            const thumbnailData = fs.readFileSync(thumbnailFilePath);

            // Upload to Digital Ocean Spaces
            await s3.putObject({
              Bucket: config.doSpaces.bucketName,
              Key: key,
              Body: thumbnailData,
              ContentType: 'image/png',
              ACL: 'public-read'
            }).promise();

            // Generate thumbnail URL using helper function
            const thumbnailUrl = getCdnUrl(key);

            // Update metadata with thumbnail URL
            const updateData = {
              id: jobData.id,
              thumbnailUrl: thumbnailUrl
            };

            // Send update to API server
            RabbitMQ.sendToQueue(
              API_SERVER_EVENTS.VIDEO_THUMBNAIL_GENERATED_EVENT,
              updateData
            );

            console.log(`Thumbnail uploaded to ${thumbnailUrl}`);
          } catch (error) {
            errorLogger.error('Error uploading thumbnail:', error.message);
            console.log('Error uploading thumbnail:', error);
          }

          // notify
          RabbitMQ.sendToQueue(
            API_GATEWAY_EVENTS.NOTIFY_VIDEO_THUMBNAIL_GENERATED,
            {
              userId: jobData.userId,
              status: 'success',
              name: 'Video thumbnail',
              fileName: fileNameWithoutExt,
              message: 'Video thumbnail generated',
            },
          );

          resolve();
        })
        .on('error', (err) => {
          errorLogger.error('Error generating thumbnail:', err.message);
          reject(err);
        });
    });

  } catch (error) {
    errorLogger.error('Error getting video resolution:', error.message);
    console.log('Error getting video resolution:', error);

    // Use default size if we can't get the video resolution
    const DEFAULT_SIZE = '320x240';
    console.log(`Using default thumbnail size: ${DEFAULT_SIZE}`);

    await new Promise<void>((resolve) => {
      ffmpeg(filePath)
        .screenshots({
          timestamps: ['00:01'],
          filename: thumbnailFileName,
          folder: `${outputFolder}`,
          size: DEFAULT_SIZE, // Default 4:3 size
        })
        .on('end', function () {
          console.log(`Generated thumbnail with default size ${DEFAULT_SIZE}`);

          // Still try to upload the thumbnail even with default size
          try {
            const videoId = jobData.id || `video-${Date.now()}`;
            const userFolder = getUserFolder(jobData.userId, videoId);
            const key = `${userFolder}/${thumbnailFileName}`;

            // Read the thumbnail file
            const thumbnailData = fs.readFileSync(thumbnailFilePath);

            // Upload to Digital Ocean Spaces
            s3.putObject({
              Bucket: config.doSpaces.bucketName,
              Key: key,
              Body: thumbnailData,
              ContentType: 'image/png',
              ACL: 'public-read'
            }).promise()
              .then(() => {
                // Generate thumbnail URL using helper function
                const thumbnailUrl = getCdnUrl(key);

                // Update metadata with thumbnail URL
                const updateData = {
                  id: jobData.id,
                  thumbnailUrl: thumbnailUrl
                };

                // Send update to API server
                RabbitMQ.sendToQueue(
                  API_SERVER_EVENTS.VIDEO_THUMBNAIL_GENERATED_EVENT,
                  updateData
                );

                console.log(`Thumbnail uploaded to ${thumbnailUrl}`);

                // Notify users
                RabbitMQ.sendToQueue(
                  API_GATEWAY_EVENTS.NOTIFY_VIDEO_THUMBNAIL_GENERATED,
                  {
                    userId: jobData.userId,
                    status: 'success',
                    name: 'Video thumbnail',
                    fileName: fileNameWithoutExt,
                    message: 'Video thumbnail generated',
                  }
                );
              })
              .catch(err => {
                errorLogger.error('Error uploading default thumbnail:', err.message);
              });
          } catch (uploadError) {
            errorLogger.error('Error handling default thumbnail:', uploadError.message);
          }

          resolve();
        })
        .on('error', function (err) {
          errorLogger.error('Error generating default thumbnail:', err.message);
          resolve(); // Still resolve to avoid blocking the process
        });
    });
  }

  return result;
};

export { generateThumbnail, processRawFileToMp4WithWatermark };

import { Job } from 'bullmq';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { QUEUE_EVENTS } from '../constant/events';
import { addQueueItem } from '../queues/addJobToQueue';
import { logger } from '../shared/logger';
import processMp4ToHls from './hlsConvertProcessor';
import { generateThumbnail, processRawFileToMp4WithWatermark } from './mp4ConvertProcessor';
// Define web-ready formats that may not need conversion to MP4
const WEB_READY_FORMATS = ['.mp4', '.webm', '.mov', '.m4v'];

// Function to check if a video needs conversion
const needsConversion = (filePath: string): boolean => {
  const fileExt = path.extname(filePath).toLowerCase();
  
  // If it's in our list of web-ready formats, we can skip conversion
  return !WEB_READY_FORMATS.includes(fileExt);
};

const uploadedHandler = async (job: Job) => {
  logger.info('i am the uploaded handler!', job.data.title);
  await addQueueItem(QUEUE_EVENTS.VIDEO_PROCESSING, {
    ...job.data,
    completed: true,
  });
  return;
};

const processingHandler = async (job: Job) => {
  console.log('i am the processing handler!', job.data);
  
  try {
    const filePath = `./${job.data.path}`;
    const fileName = path.basename(filePath);
    
    // Create folder based on path from job data
    const folderName = job.data.destination.split('/')[1];
    const uploadPath = `uploads/${folderName}/processed`;
    const thumbnailPath = `uploads/${folderName}/thumbnails`;
    
    // Create directories safely
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
      fs.mkdirSync(thumbnailPath, { recursive: true });
    } catch (err) {
      logger.error(`Error creating directories:`, err);
      throw new Error(`Failed to create processing directories: ${err.message}`);
    }
    
    // Check if file needs conversion to MP4
    if (!needsConversion(filePath)) {
      logger.info(`File ${filePath} is already in a web-ready format, skipping conversion`);
      
      try {
        // Generate output filename with .mp4 extension to ensure consistency
        const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
        const destPath = `${uploadPath}/${fileNameWithoutExt}.mp4`;
        
        // If not MP4, convert to MP4 otherwise just copy
        if (path.extname(filePath).toLowerCase() !== '.mp4') {
          // Simple format conversion without other processing
          await new Promise((resolve, reject) => {
  
            ffmpeg(filePath)
              .output(destPath)
              .outputOptions('-c copy') // Just copy streams, no re-encoding
              .on('end', resolve)
              .on('error', reject)
              .run();
          });
        } else {
          // Just copy the file if it's already MP4
          fs.copyFileSync(filePath, destPath);
        }
        
        // Generate thumbnail
        await generateThumbnail(filePath, thumbnailPath, {
          ...job.data,
          completed: true,
          folderName
        });
        
        // Move directly to next step
        await addQueueItem(QUEUE_EVENTS.VIDEO_PROCESSED, {
          ...job.data,
          completed: true,
          path: destPath
        });
      } catch (error) {
        logger.error('Error processing web-ready file:', error);
        throw error;
      }
    } else {
      // Process files that need conversion
      await processRawFileToMp4WithWatermark(filePath, uploadPath, {
        ...job.data,
        completed: true,
        next: QUEUE_EVENTS.VIDEO_PROCESSED,
      });
    }
  } catch (error) {
    logger.error('Error in processingHandler:', error);
    throw error;
  }
  
  return;
};

const processedHandler = async (job: Job) => {
  logger.info('i am the processed handler!', job.data.path);
  await addQueueItem(QUEUE_EVENTS.VIDEO_HLS_CONVERTING, {
    ...job.data,
    completed: true,
  });
  return;
};

const hlsConvertingHandler = async (job: Job) => {
  logger.info('i am the hls converting handler!', job.data);
  const folderName = job.data.destination.split('/')[1];
  const uploadPath = `uploads/${folderName}/hls`;
  logger.info(uploadPath, 'checing upload hls upload pathe');

  fs.mkdirSync(uploadPath, { recursive: true });
  await processMp4ToHls(`./${job.data.path}`, uploadPath, {
    ...job.data,
    completed: true,
    next: QUEUE_EVENTS.VIDEO_HLS_CONVERTED,
  });
  return;
};

const hlsConvertedHandler = async (job: Job) => {
  logger.info('hls converted handler!', job.data);
  // await addQueueItem(NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED, {
  //   ...job.data,
  //   completed: true,
  //   next: null,
  // });
  // notifyVideoHlsConvertedHandler(job);
  return;
};

export const QUEUE_EVENT_HANDLERS = {
  [QUEUE_EVENTS.VIDEO_UPLOADED]: uploadedHandler,
  [QUEUE_EVENTS.VIDEO_PROCESSING]: processingHandler,
  [QUEUE_EVENTS.VIDEO_PROCESSED]: processedHandler,
  [QUEUE_EVENTS.VIDEO_HLS_CONVERTING]: hlsConvertingHandler,
  [QUEUE_EVENTS.VIDEO_HLS_CONVERTED]: hlsConvertedHandler,
  // [NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED]: notifyVideoHlsConvertedHandler,
};

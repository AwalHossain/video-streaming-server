/* eslint-disable @typescript-eslint/no-explicit-any */
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { API_GATEWAY_EVENTS, QUEUE_EVENTS } from '../constant/events';
import { addQueueItem } from '../queues/addJobToQueue';
import { errorLogger, logger } from '../shared/logger';
import RabbitMQ from '../shared/rabbitMQ';
import {
  getImageAspectRatio,
  getVideoDurationAndResolution,
} from './videoProcessingHandler';

ffmpeg.setFfmpegPath(ffmpegPath);
interface JobData {
  completed: boolean;
  path: string;
  destination: string;
  userId: string;
}

interface ProcessedFile {
  fileName: string;
  outputFileName: string;
}

interface WatermarkFile {
  fileName: string;
  outputFileName: string;
  watermarkImage: string;
}

const processRawFileToMp4WithWatermark = async (
  filePath: string,
  outputFolder: string,
  jobData: JobData,
  watermarkImageFilePath?: string | null,
): Promise<WatermarkFile> => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);

  console.log(fileExt, 'fileExt', fileNameWithoutExt, 'fileNameWithoutExt');

  const outputFileName = `${outputFolder}/${fileNameWithoutExt}.mp4`;

  const ffmpegCommand = ffmpeg(filePath).output(outputFileName);

  const videoMetadata = await getVideoDurationAndResolution(filePath);

  // Calculate the dimensions for the watermark image based on the video's aspect ratio.
  const videoWidth = videoMetadata.videoResolution.width;
  const videoHeight = videoMetadata.videoResolution.height;

  if (watermarkImageFilePath) {
    const watermarkAspectRatio = (await getImageAspectRatio(
      watermarkImageFilePath,
    )) as any;
    const [widthRatio, heightRatio] = watermarkAspectRatio
      .split(':')
      .map(Number);
    const aspectRatioDecimal = widthRatio / heightRatio;

    logger.info(
      'Aspect Ratio',
      aspectRatioDecimal,
      'watermarkAspectRatio',
      videoMetadata,
      'videoMetadata',
    );

    const watermarkWidth = videoWidth / 9; // Adjust the scaling factor as needed.
    const watermarkHeight = watermarkWidth / aspectRatioDecimal;

    if (!aspectRatioDecimal || isNaN(aspectRatioDecimal)) {
      console.error('Invalid watermark aspect ratio');
      return;
    }
    ffmpegCommand
      .input(watermarkImageFilePath)
      .complexFilter([
        `[0:v]scale=${videoWidth}:${videoHeight}[bg];` +
          `[1:v]scale=${watermarkWidth}:${watermarkHeight}[watermark];` +
          `[bg][watermark]overlay=W-w-10:10:enable='between(t,0,inf)'`,
      ]);
  }
  let lastReportedProgress = 0;

  ffmpegCommand
    .on('start', function (commandLine: string) {
      logger.info('Spawned Ffmpeg with command: ' + commandLine);
      // io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSING, {
      //   status: 'processing',
      //   name: 'Video mp4',
      //   fileName: fileNameWithoutExt,
      //   progress: 1,
      //   message: 'Video conveting to mp4 Processing',
      // });

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
        logger.info('Processing: ' + progress.percent + '% done');
        // io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSING, {
        //   status: 'processing',
        //   name: 'Video mp4',
        //   fileName: fileNameWithoutExt,
        //   progress: lastReportedProgress,
        //   message: 'Video conveting to mp4 Processing',
        // });

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
      // io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSING, {
      //   status: 'completed',
      //   name: 'Video mp4',
      //   progress: 100,
      //   fileName: fileNameWithoutExt,
      //   message: 'Video converting to mp4 Processing',
      // });

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

      // io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSED, {
      //   status: 'success',
      //   name: 'Video mp4',
      //   fileName: fileNameWithoutExt,
      //   message: 'Video Processed',
      // });

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
    })
    .on('error', function (err: Error) {
      // io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSING, {
      //   status: 'failed',
      //   name: 'Video Mp4 Processing',
      //   progress: 0,
      //   fileName: fileNameWithoutExt,
      //   message: 'Video Processed failed',
      // });

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
};

const generateThumbnail = async (
  filePath: string,
  outputFolder: string,
  jobData: JobData,
): Promise<ProcessedFile> => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);
  const thumbnailFileName = `${fileNameWithoutExt}.png`;
  logger.info(thumbnailFileName, 'thumbnailFileName');
  ffmpeg(filePath)
    .screenshots({
      timestamps: ['00:01'],
      filename: thumbnailFileName,
      folder: `${outputFolder}`,
      size: '320x240',
    })
    .on('end', async function () {
      logger.info('hthumnail generated!', jobData.path);
      // await addQueueItem(QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED, {
      //   ...jobData,
      //   completed: true,
      //   path: thumbnailFileName
      // });
    });
  return;
};

export { generateThumbnail, processRawFileToMp4WithWatermark };

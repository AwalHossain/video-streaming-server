/* eslint-disable @typescript-eslint/no-explicit-any */
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { API_GATEWAY_EVENTS, QUEUE_EVENTS } from '../constant/events';
import { addQueueItem } from '../queues/addJobToQueue';
import { errorLogger } from '../shared/logger';
import RabbitMQ from '../shared/rabbitMQ';

ffmpeg.setFfmpegPath(ffmpegPath);
interface JobData {
  completed: boolean;
  path: string;
  destination: string;
  userId: string;
  fileName: string;
  folderName: string;
  next: string;
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
  console.log(thumbnailFileName, 'thumbnailFileName');
  ffmpeg(filePath)
    .screenshots({
      timestamps: ['00:01'],
      filename: thumbnailFileName,
      folder: `${outputFolder}`,
      size: '320x240',
    })
    .on('end', async function () {
      console.log(jobData.fileName, 'thumbnail generated!', jobData.path);
      // await addQueueItem(QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED, {
      //   ...jobData,
      //   completed: true,
      //   path: thumbnailFileName
      // });
    });
  return;
};

export { generateThumbnail, processRawFileToMp4WithWatermark };

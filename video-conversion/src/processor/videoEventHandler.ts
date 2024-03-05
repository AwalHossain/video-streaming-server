import { Job } from 'bullmq';
import fs from 'fs';
import { QUEUE_EVENTS } from '../constant/events';
import { addQueueItem } from '../queues/addJobToQueue';
import { logger } from '../shared/logger';
import processMp4ToHls from './hlsConvertProcessor';
import { processRawFileToMp4WithWatermark } from './mp4ConvertProcessor';

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

  // create folder based on path that getiing form job data

  const folderName = job.data.destination.split('/')[1];
  const uploadPath = `uploads/${folderName}/processed`;
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log(
    'upload path from processing Handler, Before Proceeding to processRawFileToMp4WithWatermark process(1)',

    job.data,
  );
  await processRawFileToMp4WithWatermark(`./${job.data.path}`, uploadPath, {
    ...job.data,
    completed: true,
    next: QUEUE_EVENTS.VIDEO_PROCESSED,
  });

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

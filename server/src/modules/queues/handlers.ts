import { Job } from "bullmq";
import fs from "fs";
import eventEmitter from "../../event-manager";
import { NOTIFY_EVENTS, QUEUE_EVENTS } from "./constants";
import { addQueueItem } from "./queue";
import { processMp4ToHls, processRawFileToMp4WithWatermark, } from "./video-processor";


const uploadedHandler = async (job: Job) => {
  console.log("i am the uploaded handler!", job.data.title);
  await addQueueItem(QUEUE_EVENTS.VIDEO_PROCESSING, {
    ...job.data,
    completed: true,
  });
  return;
};

const processingHandler = async (job: Job) => {
  console.log(job,"i am the processing handler!", job.data);

  // create folder based on path that getiing form job data

  const folderName = job.data.destination.split("/")[1];
  const uploadPath = `uploads/${folderName}/processed`;
  fs.mkdirSync(uploadPath, { recursive: true });
  const processed = await processRawFileToMp4WithWatermark(
    `./${job.data.path}`,
    uploadPath,
    {
      ...job.data,
      completed: true,
      next: QUEUE_EVENTS.VIDEO_PROCESSED,
    },
    './uploads/img/player.png'
  );
  console.log("processed", processed);
  return;
};

const processedHandler = async (job: Job) => {
  console.log("i am the processed handler!", job.data.path);
  await addQueueItem(QUEUE_EVENTS.VIDEO_HLS_CONVERTING, {
    ...job.data,
    completed: true,
  });
  return;
};

const watermarkingHandler = async (job: Job) => {
  console.log("i am the watermarking handler!", job.data.path);
  const folderName = job.data.destination.split("/")[1];
  const uploadPath = `uploads/${folderName}/watermarked`;
  fs.mkdirSync(uploadPath, { recursive: true });
  const watermarked = await processRawFileToMp4WithWatermark(
    `./${job.data.path}`,
   uploadPath,
    {
      ...job.data,
      completed: true,
      next: QUEUE_EVENTS.VIDEO_WATERMARKED,
    },
    `./uploads/img/player.png`,
  );
    
  console.log("watermarked", watermarked);
  return;
};

const watermarkedHandler = async (job: Job) => {
  console.log("i am the watermarked handler!", job.data.path);
  await addQueueItem(QUEUE_EVENTS.VIDEO_HLS_CONVERTING, {
    ...job.data,
    completed: true,
  });
  return;
};


const hlsConvertingHandler = async (job: Job) => {
  console.log("i am the hls converting handler!", job.data.path);
  const folderName = job.data.destination.split("/")[1];
  const uploadPath = `uploads/${folderName}/hls`;
  fs.mkdirSync(uploadPath, { recursive: true });
  const hlsConverted = await processMp4ToHls(
    `./${job.data.path}`,
    uploadPath,
    {
      ...job.data,
      completed: true,
      next: QUEUE_EVENTS.VIDEO_HLS_CONVERTED,
    }
  );
  console.log("hlsConverted", hlsConverted);
  return;
};

const hlsConvertedHandler = async (job) => {
  console.log("hls converted handler!", job.data.filename);
  await addQueueItem(NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED, {
    ...job.data,
    completed: true,
    next: null,
  });
  return;
};

const notifyVideoHlsConvertedHandler = async (job) => {
  console.log("notifyVideoHlsConvertedHandler handler!", job.data);
  eventEmitter.emit(`${NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED}`, job.data);
  return { ...job.data, completed: true, next: null };
};
export const QUEUE_EVENT_HANDLERS = {
  [QUEUE_EVENTS.VIDEO_UPLOADED]: uploadedHandler,
  [QUEUE_EVENTS.VIDEO_PROCESSING]: processingHandler,
  [QUEUE_EVENTS.VIDEO_PROCESSED]: processedHandler,
  [QUEUE_EVENTS.VIDEO_WATERMARKING]: watermarkingHandler,
  [QUEUE_EVENTS.VIDEO_WATERMARKED]: watermarkedHandler,
  [QUEUE_EVENTS.VIDEO_HLS_CONVERTING]: hlsConvertingHandler,
  [QUEUE_EVENTS.VIDEO_HLS_CONVERTED]: hlsConvertedHandler,
  [NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED]: notifyVideoHlsConvertedHandler,
};

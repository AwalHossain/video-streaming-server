import { Job } from "bullmq";
import fs from "fs";
import path from "path";
import EventEmitter from "../../event-manager";
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
  console.log("i am the processing handler!", job.data);

  // create folder based on path that getiing form job data

  const folderName = job.data.destination.split("/")[1];
  const uploadPath = `uploads/${folderName}/processed`;
  fs.mkdirSync(uploadPath, { recursive: true });

  let watermarkPath = job.data?.watermarkPath;
  console.log("watermarkPath checkkkkk.....", watermarkPath);

  if (watermarkPath && !fs.existsSync(path.resolve(watermarkPath))) {
    watermarkPath = null;
  }
  const processed = await processRawFileToMp4WithWatermark(
    `./${job.data.path}`,
    uploadPath,
    {
      ...job.data,
      completed: true,
      next: QUEUE_EVENTS.VIDEO_PROCESSED,
    },
    watermarkPath ? `./${watermarkPath}` : null,
  );

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



const hlsConvertingHandler = async (job: Job) => {
  console.log("i am the hls converting handler!", job.data);
  const folderName = job.data.destination.split("/")[1];
  const uploadPath = `uploads/${folderName}/hls`;
  console.log(uploadPath, 'checing upload hls upload pathe');

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
  return;
};

const hlsConvertedHandler = async (job: Job) => {
  console.log("hls converted handler!", job.data);
  await addQueueItem(NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED, {
    ...job.data,
    completed: true,
    next: null,
  });
  // notifyVideoHlsConvertedHandler(job);
  return;
};

const notifyVideoHlsConvertedHandler = async (job) => {
  console.log('notifyVideoHlsConvertedHandler handler!', job.data);
  EventEmitter.emit(`${NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED}`, job.data);
  return { ...job.data, completed: true, next: null };
};
export const QUEUE_EVENT_HANDLERS = {
  [QUEUE_EVENTS.VIDEO_UPLOADED]: uploadedHandler,
  [QUEUE_EVENTS.VIDEO_PROCESSING]: processingHandler,
  [QUEUE_EVENTS.VIDEO_PROCESSED]: processedHandler,
  [QUEUE_EVENTS.VIDEO_HLS_CONVERTING]: hlsConvertingHandler,
  [QUEUE_EVENTS.VIDEO_HLS_CONVERTED]: hlsConvertedHandler,
  [NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED]: notifyVideoHlsConvertedHandler,
};

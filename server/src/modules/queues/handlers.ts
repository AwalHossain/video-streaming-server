import { Job } from "bullmq";
import { NOTIFY_EVENTS, QUEUE_EVENTS } from "./constants";
import { addQueueItem } from "./queue";
import { processMp4ToHls, processRawFileToMp4 } from "./video-processor";

const uploadedHandler = async (job: Job) => {
  console.log("i am the uploaded handler!", job.data.title);
  await addQueueItem(QUEUE_EVENTS.VIDEO_PROCESSING, {
    ...job.data,
    completed: true,
  });
  return;
};

const processingHandler = async (job: Job) => {
  console.log("i am the processing handler!", job.data.path);
  const processed = await processRawFileToMp4(
    `./${job.data.path}`,
    `./uploads/processed`,
    {
      ...job.data,
      completed: true,
      next: QUEUE_EVENTS.VIDEO_PROCESSED,
    }
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

const hlsConvertingHandler = async (job: Job) => {
  console.log("i am the hls converting handler!", job.data.path);
  const hlsConverted = await processMp4ToHls(
    `./${job.data.path}`,
    `./uploads/hls`,
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
  console.log("i am the hls converted handler!", job.data.filename);
  return;
};

// const watermarkingHandler = async (job: Job) => {
//   console.log("i am the watermarking handler!", job.data.size);
//   return;
// };

// const watermarkedHandler = async (job: Job) => {
//   console.log("i am the watermarked handler!", job.data.completed);
//   return;
// };
/** Each of the queue event will be associated with the handler and create an object */

export const QUEUE_EVENT_HANDLERS = {
  [QUEUE_EVENTS.VIDEO_UPLOADED]: uploadedHandler,
  [QUEUE_EVENTS.VIDEO_PROCESSING]: processingHandler,
  [QUEUE_EVENTS.VIDEO_PROCESSED]: processedHandler,
  [QUEUE_EVENTS.VIDEO_HLS_CONVERTING]: hlsConvertingHandler,
  [QUEUE_EVENTS.VIDEO_HLS_CONVERTED]: hlsConvertedHandler,
  // [QUEUE_EVENTS.VIDEO_WATERMARKING]: watermarkingHandler,
  // [QUEUE_EVENTS.VIDEO_WATERMARKED]: watermarkedHandler,
  [NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED]: hlsConvertedHandler,
};

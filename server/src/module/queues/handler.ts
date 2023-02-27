/** queue names: 
video.uploaded
video.processing
video.processed
video.hls-converting
video.hls.converted
video.watermarking
video.watermarked
*/

import { QUEUES_EVENTS } from "./constants";
import { addQueueItem } from "./queue";
import { processRawFiletoMp4 } from "./video-processor";

const uploadedHandler = async (job: any) => {
  console.log("I am uploaded handler", job.data.mimetype);

  await addQueueItem(QUEUES_EVENTS.VIDEO_PROCESSING, {
    ...job.data,
    completed: true,
  });
  return { ...job.data, completed: true, next: QUEUES_EVENTS.VIDEO_PROCESSING };
};

const processingHandler = async (job: any) => {
  console.log("I am the Video processing handler", job.data.path);

  const processed = await processRawFiletoMp4(
    `./${job.data.path}`,
    "./upload/processed",
    {
      ...job.data,
      completed: true,
      next: QUEUES_EVENTS.VIDEO_PROCESSED,
    }
  );

  console.log("processed", processed);

  return { ...job.data, completed: true, next: QUEUES_EVENTS.VIDEO_PROCESSED };
};

const processedHandler = async (job: any) => {
  console.log("i am Video processed handler", job.data.fieldname);

  return {
    ...job.data,
    completed: true,
    next: QUEUES_EVENTS.VIDEO_HLS_CONVERTING,
  };
};

const hlsConvertingHandler = async (job: any) => {
  console.log("i am Video hls converting handler", job.data.originalname);

  return {
    ...job.data,
    completed: true,
    next: QUEUES_EVENTS.VIDEO_HLS_CONVERTED,
  };
};

const hlsConvertedHandler = async (job: any) => {
  console.log("i am Video hls converted handler", job.data.filename);

  return {
    ...job.data,
    completed: true,
    next: QUEUES_EVENTS.VIDEO_WATERMARKING,
  };
};

const watermarkingHandler = async (job: any) => {
  console.log("i am Video watermarking handler", job.data.originalname);

  return {
    ...job.data,
    completed: true,
    next: QUEUES_EVENTS.VIDEO_WATERMARKED,
  };
};

const watermarkedHandler = async (job: any) => {
  console.log("i am Video watermarked handler", job.data.size);

  return { ...job.data, completed: true, next: null };
};

/** Each of the queue will be associated with the handler and create an object */

export const QUEUE_EVENT_HANDLERS = {
  [QUEUES_EVENTS.VIDEO_UPLOADED]: uploadedHandler,
  [QUEUES_EVENTS.VIDEO_PROCESSING]: processingHandler,
  [QUEUES_EVENTS.VIDEO_PROCESSED]: processedHandler,
  [QUEUES_EVENTS.VIDEO_HLS_CONVERTING]: hlsConvertingHandler,
  [QUEUES_EVENTS.VIDEO_HLS_CONVERTED]: hlsConvertedHandler,
  [QUEUES_EVENTS.VIDEO_WATERMARKING]: watermarkingHandler,
  [QUEUES_EVENTS.VIDEO_WATERMARKED]: watermarkedHandler,
};

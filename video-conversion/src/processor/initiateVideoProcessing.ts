/* eslint-disable @typescript-eslint/no-explicit-any */
// intiaate video Processing

import { API_SERVER_EVENTS, QUEUE_EVENTS } from '../constant/events';
import { addQueueItem } from '../queues/addJobToQueue';
import { logger } from '../shared/logger';
import RabbitMQ from '../shared/rabbitMQ';
import { getVideoDurationAndResolution } from './videoProcessingHandler';

type VideoPath = {
  videoPath: string;
  destination: string;
  userId: string;
  videoMetadata: any;
};

const initiateVideoProcessing = async ({
  videoPath,
  destination,
  userId,
  videoMetadata,
}: VideoPath) => {

  const { videoDuration } = await getVideoDurationAndResolution(videoPath);

  logger.info('videoDuration', videoDuration);

  const payload = {
    ...videoMetadata,
    duration: videoDuration,
    id: videoMetadata._id,
    path: videoPath,
    destination,
  };
  // store download status in the database
  RabbitMQ.sendToQueue(API_SERVER_EVENTS.UPDATE_METADATA_EVENT, {
    id: videoMetadata._id,
    videoPath,
    duration: videoDuration,
  });
  await addQueueItem(QUEUE_EVENTS.VIDEO_UPLOADED, {
    userId,
    id: videoMetadata?._id,
    ...payload,
  });
};

export default initiateVideoProcessing;

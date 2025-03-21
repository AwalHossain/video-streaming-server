/// here i am going to update the vidoe history and add the path after each processing

import dotenv from 'dotenv';
import { API_SERVER_EVENTS, QUEUE_EVENTS } from '../constant/events';
import ApiError from '../errors/apiError';
import EventEmitter from '../shared/event-manager';
import { errorLogger } from '../shared/logger';
import RabbitMQ from '../shared/rabbitMQ';
import processHLSFile from './processHLSFile';
// import { VIDEO_STATUS } from "./video.constant";
// import { VideoService } from "./video.service";
dotenv.config();

const videoLifecycleHandler = async () => {
  try {
    Object.values(QUEUE_EVENTS).forEach((queueName) => {
      EventEmitter.on(queueName, async (data) => {
        if (queueName === QUEUE_EVENTS.VIDEO_UPLOADED) {
          const dataCopy = JSON.parse(JSON.stringify(data));
          console.log(dataCopy, 'upload data........');
        }

        if (queueName === QUEUE_EVENTS.VIDEO_PROCESSED) {
          // await VideoService.updateHistory(data.id, {
          //   history: { status: queueName, createdAt: Date.now() },
          // });
          const dataCopy = JSON.parse(JSON.stringify(data));
          const processData = {
            id: dataCopy.id,
            history: { status: queueName, createdAt: Date.now() },
          };

          RabbitMQ.sendToQueue(
            API_SERVER_EVENTS.VIDEO_PROCESSED_EVENT,
            processData,
          );
        }

        if (queueName === QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED) {
          const dataCopy = JSON.parse(JSON.stringify(data));
          const sendData = {
            id: dataCopy.id,
            history: { status: queueName, createdAt: Date.now() },
          };

          RabbitMQ.sendToQueue(
            API_SERVER_EVENTS.VIDEO_THUMBNAIL_GENERATED_EVENT,
            sendData,
          );
        }

        // upload the processed file to s3

        if (queueName === QUEUE_EVENTS.VIDEO_HLS_CONVERTED) {
          await processHLSFile(data, queueName);
        }
      });
    });
  } catch (error) {
    errorLogger.error(error, 'error');
    throw new ApiError(500, 'Video lifecycle handler failed');
  }
};
export default videoLifecycleHandler;

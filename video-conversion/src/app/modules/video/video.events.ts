/* eslint-disable @typescript-eslint/no-unused-vars */
import eventManager from '../../../shared/event-manager';
import { errorLogger, logger } from '../../../shared/logger';
import { redisSubClient } from '../../../shared/redis';
import { EVENT } from '../../events/event.constant';

const initVideoEvent = () => {
  redisSubClient.subscribe(EVENT.GET_VIDEO_METADATA_EVENT, (err, count) => {
    if (err) {
      errorLogger.log('Error in lastVideoEvent', err);
    }
    logger.info('Subscribed to lastVideoEvent', count);
  });

  redisSubClient.on('message', (channel, message) => {
    if (channel === EVENT.GET_VIDEO_METADATA_EVENT) {
      logger.info(`Received the following message from ${channel}: ${message}`);
      const data = JSON.parse(message);
      eventManager.emit('videoMetadata', data);
    }
    logger.info(`Received the following message from ${channel}: ${message}`);
  });
};

export default initVideoEvent;

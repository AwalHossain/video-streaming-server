/* eslint-disable @typescript-eslint/no-unused-vars */
import eventManager from '../../../shared/event-manager';
import { redisSubClient } from '../../../shared/redis';
import { EVENT } from '../../events/event.constant';

const initVideoEvent = () => {
  redisSubClient.subscribe(EVENT.GET_VIDEO_METADATA_EVENT, (err, count) => {
    if (err) {
      console.log('Error in lastVideoEvent', err);
    }
    console.log('Subscribed to lastVideoEvent', count);
  });

  redisSubClient.on('message', (channel, message) => {
    if (channel === EVENT.GET_VIDEO_METADATA_EVENT) {
      console.log(`Received the following message from ${channel}: ${message}`);
      const data = JSON.parse(message);
      eventManager.emit('videoMetadata', data);
    }
    console.log(`Received the following message from ${channel}: ${message}`);
  });
};

export default initVideoEvent;

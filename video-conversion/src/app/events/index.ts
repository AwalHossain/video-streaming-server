import { logger } from '../../shared/logger';
import initVideoEvent from '../modules/video/video.events';
import consumeVideoMetadata from './metadataConsumet';

const subscribeToEvents = () => {
  logger.info('Subscribing to events...');

  initVideoEvent();
  logger.info('Subscribed to video download trigger events.');

  consumeVideoMetadata();
  logger.info('Subscribed to metadata consumption events.');
};

export default subscribeToEvents;

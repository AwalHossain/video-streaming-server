import { logger } from '../../shared/logger';
import initVideoEvent from '../modules/video/video.events';

const subscribeToEvents = () => {
  logger.info('subscribing to events');
  initVideoEvent();
};

export default subscribeToEvents;

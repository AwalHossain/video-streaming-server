import { logger } from './shared/logger';
import { setupAllQueueEvent } from './worker/jobWorker';

setupAllQueueEvent();
logger.info('Queue server has started! port 6379');

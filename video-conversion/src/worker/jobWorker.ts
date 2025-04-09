import { QueueEvents, Worker } from 'bullmq';
import { QUEUE_EVENTS } from '../constant/events';
import { QUEUE_EVENT_HANDLERS } from '../processor/videoEventHandler';
import videoLifecycleHandler from '../processor/videoLifecycleHandler';
import { logger } from '../shared/logger';
import { RedisClient } from '../shared/redis';

// const redisConnection = {
//   username: config.redis.username,
//   password: config.redis.password,
//   host: config.redis.host,
//   port: parseInt(config.redis.port),
// };

// const redisConnection = {
//   host: 'localhost',
//   port: 6379,
// };

export const listenQueueEvent = (queueName: string) => {
  const queueEvents = new QueueEvents(queueName, {
    connection: RedisClient.redisConnection,
  });

  // Uncomment and modify event listeners as needed
  queueEvents.on('waiting', ({ jobId }) => {
    logger.info(`A job with ID ${jobId} is waiting`);
  });

  const worker = new Worker(
    queueName,
    async (job) => {
      const handler = QUEUE_EVENT_HANDLERS[queueName];
      if (handler) {
        return await handler(job);
      }
      throw new Error('No handler found for queue: ' + queueName);
    },
    { connection: RedisClient.redisConnection, concurrency: 3 },
  );

  worker.on('failed', (job, err) => {
    logger.info(`${job.id} has failed with ${err.message}`);
  });

  logger.info(`${queueName} worker started at ${new Date().toTimeString()}`);
};

export const setupAllQueueEvent = () => {
  Object.values(QUEUE_EVENTS).map((queueName) => {
    listenQueueEvent(queueName);
  });
  videoLifecycleHandler();
  return true;
};

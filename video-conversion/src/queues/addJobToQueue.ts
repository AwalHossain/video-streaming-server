import { Queue } from 'bullmq';
import { ALL_EVENTS as QUEUE_EVENTS } from '../constant/queueEvents';

import eventEmitter from '../shared/event-manager';
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

export type QueueItem = {
  completed: boolean;
  path: string;
};

type QueueObj = {
  name: string;
  queueObj: Queue;
};

export const queues: QueueObj[] = Object.values(QUEUE_EVENTS).map(
  (queueName) => {
    return {
      name: queueName,
      queueObj: new Queue(queueName, {
        connection: RedisClient.redisConnection,
      }),
    };
  },
);

const addQueueItem = async (queueName: string, item: QueueItem) => {
  const queue = queues.find((q) => q.name === queueName);
  if (!queue) {
    throw new Error(`queue ${queueName} not found from queues file`);
  }

  logger.info('AddQuueeue ', queueName, item);

  eventEmitter.emit(queueName, item);

  await queue.queueObj.add(queueName, item, {
    removeOnComplete: true,
    removeOnFail: false,
  });

  //   const newQueue = new Queue(queueName ,{ connection: redisConnection });
  //  await newQueue.add(queueName, item, {
  //     removeOnComplete: true,
  //     removeOnFail: false,
  //   });
};

export { addQueueItem };

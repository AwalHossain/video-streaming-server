/* eslint-disable @typescript-eslint/no-explicit-any */
import { Queue } from 'bullmq';
import { ALL_EVENTS as QUEUE_EVENTS } from '../constant/events';

import eventEmitter from '../shared/event-manager';
import { RedisClient } from '../shared/redis';

type IItem = {
  [key: string]: any;
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

const addQueueItem = async (queueName: string, item: IItem) => {
  const queue = queues.find((q) => q.name === queueName);
  if (!queue) {
    throw new Error(`queue ${queueName} not found from queues file`);
  }

  console.log('AddQuueeue ', queueName, item);

  eventEmitter.emit(queueName, item);

  await queue.queueObj.add(queueName, item, {
    removeOnComplete: true,
    removeOnFail: false,
  });
};

export { addQueueItem };

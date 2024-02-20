import { QueueEvents, Worker } from 'bullmq';

import redisConnection from '../shared/redis';
import { QUEUE_EVENTS } from '../constant/queueEvents';
import { QUEUE_EVENT_HANDLERS } from '../handler/videoEventHandler';
import videoLifecycleHandler from '../handler/videoLifecycleHandler';

// const redisConnection = {
//   host: 'localhost',
//   port: 6379,
// };

export const listenQueueEvent = (queueName: string) => {
  const queueEvents = new QueueEvents(queueName, {
    connection: redisConnection,
  });

  // Uncomment and modify event listeners as needed
  queueEvents.on('waiting', ({ jobId }) => {
    console.log(`A job with ID ${jobId} is waiting`);
  });

  // ...

  const worker = new Worker(
    queueName,
    async (job) => {
      const handler = QUEUE_EVENT_HANDLERS[queueName];
      if (handler) {
        return await handler(job);
      }
      throw new Error('No handler found for queue: ' + queueName);
    },
    { connection: redisConnection },
  );

  worker.on('failed', (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
  });

  console.log(`${queueName} worker started at ${new Date().toTimeString()}`);
};

export const setupAllQueueEvent = () => {
  Object.values(QUEUE_EVENTS).map((queueName) => {
    listenQueueEvent(queueName);
  });
  videoLifecycleHandler();

  return true;
};

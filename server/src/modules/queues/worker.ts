import { QueueEvents, Worker } from "bullmq";
import { QUEUE_EVENTS } from "./constants";
import { QUEUE_EVENT_HANDLERS } from "./handlers";

const redisConnection = {
  username: 'default',
  password: 'T7GZf5gZnx8gCkrGBKlR',
  host: 'containers-us-west-126.railway.app',
  port: 5589,
};

export const listenQueueEvent = (queueName: string) => {
  const queueEvents = new QueueEvents(queueName, {
    connection: redisConnection,
  });

  // Uncomment and modify event listeners as needed
  // queueEvents.on("waiting", ({ jobId }) => {
  //   console.log(`A job with ID ${jobId} is waiting`);
  // });

  // ...

  const worker = new Worker(
    queueName,
    async (job) => {
      const handler = QUEUE_EVENT_HANDLERS[queueName];
      if (handler) {
        return await handler(job);
      }
      throw new Error("No handler found for queue: " + queueName);
    },
    { connection: redisConnection }
  );

  // Worker event listeners
  worker.on("completed", (job) => {
    console.log(`${job.id} has completed!`);
  });

  worker.on("failed", (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
  });

  console.log(`${queueName} worker started at ${new Date().toTimeString()}`);
};

export const setupAllQueueEvent = () => {
  Object.values(QUEUE_EVENTS).map((queueName) => {
    listenQueueEvent(queueName);
  });
};

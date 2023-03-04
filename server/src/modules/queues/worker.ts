import { QueueEvents, Worker } from "bullmq";
import { QUEUE_EVENTS } from "./constants";
import { QUEUE_EVENT_HANDLERS } from "./handlers";

const redisConnection = { host: "localhost", port: 6379 };

export const listenQueueEvent = (queueName: string) => {
  const queueEvents = new QueueEvents(queueName, {
    connection: redisConnection,
  });

  // queueEvents.on("waiting", ({ jobId }) => {
  //   console.log(`A job with ID ${jobId} is waiting`);
  // });

  // queueEvents.on("active", ({ jobId, prev, ...others }) => {
  //   console.log(
  //     `Job ${jobId} is now active; previous status was ${prev}`,
  //     others
  //   );
  // });

  // queueEvents.on("completed", ({ jobId, returnvalue }: any) => {
  //   console.log(`${jobId} has completed and returned.next`, returnvalue.next);
  // });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    console.log(`${jobId} has failed with reason ${failedReason}`);
  });

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

  worker.on("completed", (job) => {
    console.log(`${job.id} has completed!`);
  });

  worker.on("failed", (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
  });

  console.log(queueName, " worker started", new Date().toTimeString());
};

export const setupAllQueueEvent = () => {
  Object.values(QUEUE_EVENTS).map((queueName) => {
    listenQueueEvent(queueName);
  });
};

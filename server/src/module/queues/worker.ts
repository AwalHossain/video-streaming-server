import { ConnectionOptions, Job, QueueEvents, Worker } from 'bullmq';
import console from 'console';
import { QUEUES_EVENTS, QUEUE_EVENT_HANDLERS } from './common';
import { addQueueItem } from './queue';
const queueName = "video";

const redisConnection: ConnectionOptions = {
  host: "localhost",
  port: 6379
}

interface JobImp {
  name: string,
  payload?: Record<string, unknown>
  failed: (job: Job) => void
}

const listenQueueEvent = (queueName) => {
  const queueEvents = new QueueEvents(queueName, {
    connection: redisConnection
  })

  // queueEvents.on("waiting", ({jobId}): void=>{
  //     console.log(`A job wih ID ${jobId} is waiting`);

  // })

  // queueEvents.on("active", ({jobId, prev, ...others}):void=>{
  //     console.log(
  //         `Job ${jobId} is now active: previous status was ${prev}`, others
  //     ); 
  // })

  queueEvents.on("completed", ({ jobId, returnvalue }) => {

    console.log(`Job ${jobId} has completed with return value `, returnvalue);

  })


  queueEvents.on("failed", ({ jobId, failedReason }) => {
    console.log(`${jobId} has failed with reason ${failedReason}`);

  })


  const worker = new Worker(
    queueName,
    async (job: Job) => {
      console.log("i am queue!", queueName);
      const handler = QUEUE_EVENT_HANDLERS[queueName];
      if (!handler) {
        throw new Error(`No handler found for ${queueName}`);
      }

      const result = await handler(job);
      if (result.next) {
        await addQueueItem(result.next, result);
      }
      return result;
    },
    { connection: redisConnection }
  );


  worker.on("completed", (job: Job) => {
    console.log(`${job.id} has completed`);

  })

  console.log(queueName, "Worker started", new Date().toTimeString());


}






interface WorkerReply {
  status: number;
  message: string
}




export const setupAllQueueEvents = () => {
  Object.values(QUEUES_EVENTS).map((queueName) => {
    return listenQueueEvent(queueName)
  }
  );
};
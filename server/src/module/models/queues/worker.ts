import { ConnectionOptions, Job, QueueEvents, Worker } from 'bullmq';
import console from 'console';
import { QUEUES } from './common';
const queueName = "video";

const redisConnection:ConnectionOptions  = {
    host: "localhost",
    port: 6379
}

export interface JobImp {
    name: string,
    payload?: Record<string, unknown>
    failed:(job: Job) => void
}


Object.values(QUEUES).map((queueName)=>{

    const queueEvents = new QueueEvents(queueName, {
        connection: redisConnection
    })

    queueEvents.on("waiting", ({jobId}): void=>{
        console.log(`A job wih ID ${jobId} is waiting`);
        
    })

    queueEvents.on("active", ({jobId, prev, ...others}):void=>{
        console.log(
            `Job ${jobId} is now active: previous status was ${prev}`, others
        ); 
    })
    
    queueEvents.on("failed", ({jobId, failedReason})=>{
        console.log(`${jobId} has failed with reason ${failedReason}`);
        
    })

})


export interface WorkerReply {
    status: number;
    message: string
}

const worker = new Worker(
    queueName,
    async (job: Job) => {
      console.log("i am the worker!", job.data);
    },
    { connection: redisConnection }
  );


  worker.on("completed", (job:Job)=>{
    console.log(`${job.id} has completed`);
    
  })

  
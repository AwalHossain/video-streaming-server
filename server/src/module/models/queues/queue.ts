import { Queue } from 'bullmq';


const queueName = "video";
const redisConnection = {
    host:"localhost", port: 6379
};


const myQueue = new Queue<any, any, string>(queueName, {connection: redisConnection})

async function addJobs() {
        await myQueue.add("myJobName", { foo: "bar", date: new Date() });
        await myQueue.add("myJobName", { foo: "bar", date: new Date() })
}



export const addQueueItem =async (item:any) => {

    await myQueue.add("video.uploaded", item, {
        removeOnComplete: true,
        removeOnFail: false
    })
}




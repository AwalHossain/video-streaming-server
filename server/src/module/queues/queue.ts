import { Queue } from 'bullmq';
import { QUEUES_EVENTS } from './common';


const queueName = "video";
const redisConnection = {
    host:"localhost", port: 6379
};




const queues = Object.values(QUEUES_EVENTS).map((queueName: string)=>{
    return{
        name: queueName,
        queueObj: new Queue(queueName, {connection: redisConnection})
    }
})  




   export const addQueueItem =async (queueName:string, item: any) => {
        const queue = queues.find((q)=> q.name === queueName);

        if (!queue) {
            throw new Error(`queue ${queueName} not found`);
            
        }

        await queue.queueObj.add(queueName, item, {
            removeOnComplete: true,
            removeOnFail:false
        })
    }



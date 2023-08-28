import { Queue } from "bullmq";
import { ALL_EVENTS as QUEUE_EVENTS } from "./constants";



const redisConnection = {
  username: 'default',
  password: 'T7GZf5gZnx8gCkrGBKlR',
  host: 'containers-us-west-126.railway.app',
  port: 5589,
};

export type QueueItem = {
  completed: boolean;
  path: string;
};

type QueueObj = {
  name: string;
  queueObj: Queue;
};

const queues: QueueObj[] = Object.values(QUEUE_EVENTS).map((queueName) => {
  return {
    name: queueName,
    queueObj: new Queue(queueName, { connection: redisConnection }),
  };
});

const addQueueItem = async (queueName: string, item: QueueItem) => {
  const queue = queues.find((q) => q.name === queueName);
  if (!queue) {
    throw new Error(`queue ${queueName} not found from queues file`);
  }
  await queue.queueObj.add(queueName, item, {
    removeOnComplete: true,
    removeOnFail: false,
  });
};

export { addQueueItem };


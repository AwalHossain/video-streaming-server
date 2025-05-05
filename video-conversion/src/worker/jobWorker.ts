import { QueueEvents, Worker } from 'bullmq';
import { QUEUE_EVENTS } from '../constant/events';
import { QUEUE_EVENT_HANDLERS } from '../processor/videoEventHandler';
import videoLifecycleHandler from '../processor/videoLifecycleHandler';
import { logger } from '../shared/logger';
import { calculateOptimalConcurrency, resourceMonitor } from '../shared/resourceMonitor';
import { RedisClient } from '../shared/redis';

// Configuration for dynamic concurrency
const MIN_CONCURRENCY = 1;  // Minimum worker concurrency
const MAX_CONCURRENCY = 8;  // Maximum worker concurrency 
const RESOURCE_CHECK_INTERVAL = 60000;  // Check resources every minute

// Track created workers to update concurrency
const workers: Worker[] = [];

export const listenQueueEvent = (queueName: string) => {
  const queueEvents = new QueueEvents(queueName, {
    connection: RedisClient.redisConnection,
  });

  // Uncomment and modify event listeners as needed
  queueEvents.on('waiting', ({ jobId }) => {
    logger.info(`A job with ID ${jobId} is waiting`);
  });

  // Calculate initial optimal concurrency
  const initialConcurrency = calculateOptimalConcurrency(MIN_CONCURRENCY, MAX_CONCURRENCY);

  const worker = new Worker(
    queueName,
    async (job) => {
      const handler = QUEUE_EVENT_HANDLERS[queueName];
      if (handler) {
        return await handler(job);
      }
      throw new Error('No handler found for queue: ' + queueName);
    },
    { 
      connection: RedisClient.redisConnection, 
      concurrency: initialConcurrency,
    },
  );
  
  // Track the worker to update concurrency later
  workers.push(worker);

  worker.on('failed', (job, err) => {
    logger.info(`${job.id} has failed with ${err.message}`);
  });

  logger.info(`${queueName} worker started at ${new Date().toTimeString()} with concurrency ${initialConcurrency}`);
};

// Function to update concurrency of all workers
function updateWorkerConcurrency() {
  const optimalConcurrency = calculateOptimalConcurrency(MIN_CONCURRENCY, MAX_CONCURRENCY);
  
  for (const worker of workers) {
    // Update concurrency if it has changed
    if (worker.concurrency !== optimalConcurrency) {
      worker.concurrency = optimalConcurrency;
      logger.info(`Updated worker concurrency for ${worker.name} to ${optimalConcurrency} based on system resources`);
    }
  }
}

export const setupAllQueueEvent = () => {
  // Start monitoring system resources
  resourceMonitor.startMonitoring(RESOURCE_CHECK_INTERVAL / 3); // Update 3x per interval
  
  // Set up periodic concurrency adjustment
  setInterval(() => {
    const resources = resourceMonitor.getResources();
    logger.info(`System resources: CPU: ${resources.cpuUsage}%, Memory: ${resources.memoryUsage}%, Cores: ${resources.availableCpuCount}`);
    updateWorkerConcurrency();
  }, RESOURCE_CHECK_INTERVAL);
  
  // Set up workers for all queues
  Object.values(QUEUE_EVENTS).map((queueName) => {
    listenQueueEvent(queueName);
  });
  
  videoLifecycleHandler();
  logger.info(`Resource-based dynamic concurrency system activated (min: ${MIN_CONCURRENCY}, max: ${MAX_CONCURRENCY})`);
  return true;
};

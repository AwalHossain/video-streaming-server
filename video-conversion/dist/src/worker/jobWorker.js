"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAllQueueEvent = exports.listenQueueEvent = exports.redisConnection = void 0;
const bullmq_1 = require("bullmq");
const queueEvents_1 = require("../constant/queueEvents");
const videoEventHandler_1 = require("../handler/videoEventHandler");
const videoLifecycleHandler_1 = __importDefault(require("../handler/videoLifecycleHandler"));
const config_1 = __importDefault(require("../config"));
exports.redisConnection = {
    username: config_1.default.redis.username,
    password: config_1.default.redis.password,
    host: config_1.default.redis.host,
    port: parseInt(config_1.default.redis.port),
};
const listenQueueEvent = (queueName) => {
    const queueEvents = new bullmq_1.QueueEvents(queueName, {
        connection: exports.redisConnection,
    });
    // Uncomment and modify event listeners as needed
    // queueEvents.on('waiting', ({ jobId }) => {
    //   console.log(`A job with ID ${jobId} is waiting`);
    // });
    // ...
    const newWorker = new bullmq_1.Worker(queueName, async (job) => {
        console.log('Job received', job.id, job.name, job.data);
        return job.data;
    }, { connection: exports.redisConnection });
    const worker = new bullmq_1.Worker(queueName, async (job) => {
        console.log('Job received', job.id, job.name, job.data);
        const handler = videoEventHandler_1.QUEUE_EVENT_HANDLERS[queueName];
        if (handler) {
            return await handler(job);
        }
        throw new Error('No handler found for queue: ' + queueName);
    }, { connection: exports.redisConnection });
    worker.on('failed', (job, err) => {
        console.log(`${job.id} has failed with ${err.message}`);
    });
    console.log(`${queueName} worker started at ${new Date().toTimeString()}`);
};
exports.listenQueueEvent = listenQueueEvent;
const setupAllQueueEvent = () => {
    Object.values(queueEvents_1.QUEUE_EVENTS).map((queueName) => {
        (0, exports.listenQueueEvent)(queueName);
    });
    (0, videoLifecycleHandler_1.default)();
    return true;
};
exports.setupAllQueueEvent = setupAllQueueEvent;

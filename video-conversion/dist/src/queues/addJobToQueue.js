"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addQueueItem = exports.queues = void 0;
const bullmq_1 = require("bullmq");
const queueEvents_1 = require("../constant/queueEvents");
const event_manager_1 = __importDefault(require("../shared/event-manager"));
const jobWorker_1 = require("../worker/jobWorker");
exports.queues = Object.values(queueEvents_1.ALL_EVENTS).map((queueName) => {
    return {
        name: queueName,
        queueObj: new bullmq_1.Queue(queueName, { connection: jobWorker_1.redisConnection }),
    };
});
const addQueueItem = async (queueName, item) => {
    const queue = exports.queues.find((q) => q.name === queueName);
    if (!queue) {
        throw new Error(`queue ${queueName} not found from queues file`);
    }
    console.log('AddQuueeue ', queueName, item);
    event_manager_1.default.emit(queueName, item);
    const newJ = await queue.queueObj.add(queueName, item, {
        removeOnComplete: true,
        removeOnFail: false,
    });
    console.log(`Job added to queue: ${JSON.stringify(newJ, null, 2)}`);
};
exports.addQueueItem = addQueueItem;

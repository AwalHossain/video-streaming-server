"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUE_EVENT_HANDLERS = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const event_manager_1 = __importDefault(require("../shared/event-manager"));
const queueEvents_1 = require("../constant/queueEvents");
const addJobToQueue_1 = require("../queues/addJobToQueue");
const videoProcessingHandler_1 = require("./videoProcessingHandler");
const uploadedHandler = async (job) => {
    console.log("i am the uploaded handler!", job.data.title);
    await (0, addJobToQueue_1.addQueueItem)(queueEvents_1.QUEUE_EVENTS.VIDEO_PROCESSING, {
        ...job.data,
        completed: true,
    });
    return;
};
const processingHandler = async (job) => {
    var _a;
    console.log("i am the processing handler!", job.data);
    // create folder based on path that getiing form job data
    const folderName = job.data.destination.split("/")[1];
    const uploadPath = `uploads/${folderName}/processed`;
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
    let watermarkPath = (_a = job.data) === null || _a === void 0 ? void 0 : _a.watermarkPath;
    console.log("watermarkPath checkkkkk.....", watermarkPath);
    if (watermarkPath && !fs_1.default.existsSync(path_1.default.resolve(watermarkPath))) {
        watermarkPath = null;
    }
    const processed = await (0, videoProcessingHandler_1.processRawFileToMp4WithWatermark)(`./${job.data.path}`, uploadPath, {
        ...job.data,
        completed: true,
        next: queueEvents_1.QUEUE_EVENTS.VIDEO_PROCESSED,
    }, watermarkPath ? `./${watermarkPath}` : null);
    return;
};
const processedHandler = async (job) => {
    console.log("i am the processed handler!", job.data.path);
    await (0, addJobToQueue_1.addQueueItem)(queueEvents_1.QUEUE_EVENTS.VIDEO_HLS_CONVERTING, {
        ...job.data,
        completed: true,
    });
    return;
};
const hlsConvertingHandler = async (job) => {
    console.log("i am the hls converting handler!", job.data);
    const folderName = job.data.destination.split("/")[1];
    const uploadPath = `uploads/${folderName}/hls`;
    console.log(uploadPath, 'checing upload hls upload pathe');
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
    const hlsConverted = await (0, videoProcessingHandler_1.processMp4ToHls)(`./${job.data.path}`, uploadPath, {
        ...job.data,
        completed: true,
        next: queueEvents_1.QUEUE_EVENTS.VIDEO_HLS_CONVERTED,
    });
    return;
};
const hlsConvertedHandler = async (job) => {
    console.log("hls converted handler!", job.data);
    await (0, addJobToQueue_1.addQueueItem)(queueEvents_1.NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED, {
        ...job.data,
        completed: true,
        next: null,
    });
    // notifyVideoHlsConvertedHandler(job);
    return;
};
const notifyVideoHlsConvertedHandler = async (job) => {
    console.log('notifyVideoHlsConvertedHandler handler!', job.data);
    event_manager_1.default.emit(`${queueEvents_1.NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED}`, job.data);
    return { ...job.data, completed: true, next: null };
};
exports.QUEUE_EVENT_HANDLERS = {
    [queueEvents_1.QUEUE_EVENTS.VIDEO_UPLOADED]: uploadedHandler,
    [queueEvents_1.QUEUE_EVENTS.VIDEO_PROCESSING]: processingHandler,
    [queueEvents_1.QUEUE_EVENTS.VIDEO_PROCESSED]: processedHandler,
    [queueEvents_1.QUEUE_EVENTS.VIDEO_HLS_CONVERTING]: hlsConvertingHandler,
    [queueEvents_1.QUEUE_EVENTS.VIDEO_HLS_CONVERTED]: hlsConvertedHandler,
    [queueEvents_1.NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED]: notifyVideoHlsConvertedHandler,
};

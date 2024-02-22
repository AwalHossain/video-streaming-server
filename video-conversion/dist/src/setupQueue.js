"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jobWorker_1 = require("./worker/jobWorker");
const bootstrap = async () => {
    (0, jobWorker_1.setupAllQueueEvent)();
    console.log("Queue server has started! port 6379");
};
exports.default = bootstrap;

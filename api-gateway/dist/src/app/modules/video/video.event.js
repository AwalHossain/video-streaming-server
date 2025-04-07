"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rabbitMQ_1 = __importDefault(require("../../../shared/rabbitMQ"));
const broadcastVideoEvent = async (eventName, payload) => {
    rabbitMQ_1.default.sendToQueue(eventName, payload);
};
exports.default = broadcastVideoEvent;
//# sourceMappingURL=video.event.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const video_events_1 = __importDefault(require("../modules/video/video.events"));
const subscribeToEvents = () => {
    console.log("subscribing to events");
    (0, video_events_1.default)();
};
exports.default = subscribeToEvents;

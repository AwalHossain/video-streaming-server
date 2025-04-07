"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("../../../constants/event");
const rabbitMQ_1 = __importDefault(require("../../../shared/rabbitMQ"));
const video_service_1 = require("./video.service");
const initVideoEvents = () => {
    rabbitMQ_1.default.consume(event_1.API_SERVER_EVENTS.INSERT_VIDEO_METADATA_EVENT, async (msg, ack) => {
        try {
            // Process the message
            console.log(msg.content.toString(), "msg.content.toString()");
            const data = JSON.parse(msg.content.toString());
            await video_service_1.VideoService.insertIntoDBFromEvent(data);
            // Acknowledge the message
            ack();
        }
        catch (error) {
            console.error("Error processing message:", error);
            // Optionally, you can reject the message, which will requeue it
            // channel.nack(msg);
        }
    });
    // update metadata event
    rabbitMQ_1.default.consume(event_1.API_SERVER_EVENTS.UPDATE_METADATA_EVENT, async (msg, ack) => {
        console.log(`Received the following message from VIDEO_processed_EVENT: ${msg.content.toString()}`);
        const data = JSON.parse(msg.content.toString());
        console.log(`Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${data}`);
        await video_service_1.VideoService.update(data.id, { ...data });
        ack();
    });
    // update processed event
    rabbitMQ_1.default.consume(event_1.API_SERVER_EVENTS.VIDEO_PROCESSED_EVENT, async (msg, ack) => {
        console.log(`Received the following message from VIDEO_processed_EVENT: ${msg.content.toString()}`);
        const data = JSON.parse(msg.content.toString());
        console.log(`Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${data}`);
        // Add validation for required fields
        if (!data.id) {
            console.error('Missing video ID in message:', data);
            ack(); // Acknowledge but log error
            return;
        }
        await video_service_1.VideoService.updateHistory(data.id, data.history);
        ack();
    });
    // update thumbnail
    rabbitMQ_1.default.consume(event_1.API_SERVER_EVENTS.VIDEO_THUMBNAIL_GENERATED_EVENT, async (msg, ack) => {
        console.log(`Received the following message from VIDEO_thumbnail_EVENT: ${msg.content.toString()}`);
        const data = JSON.parse(msg.content.toString());
        // Add validation for required fields
        if (!data.id) {
            console.error('Missing video ID in message:', data);
            ack(); // Acknowledge but log error
            return;
        }
        console.log(`Received the following message from VIdeo_thumbnail_CONVERTED_EVENT: ${data}`);
        await video_service_1.VideoService.updateHistory(data.id, data.history);
        ack();
    });
    // update HLS converted
    rabbitMQ_1.default.consume(event_1.API_SERVER_EVENTS.VIDEO_HLS_CONVERTED_EVENT, async (msg, ack) => {
        console.log(`Received the following message from VIDEO_published_EVENT: ${msg.content.toString()}`);
        const data = JSON.parse(msg.content.toString());
        console.log(`Received the following message from VIDEO_published_EVENT: ${data}`);
        await video_service_1.VideoService.updateHistory(data.id, data.history);
        ack();
    });
    // update published
    rabbitMQ_1.default.consume(event_1.API_SERVER_EVENTS.VIDEO_PUBLISHED_EVENT, async (msg, ack) => {
        console.log(`Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${msg.content.toString()}`);
        const data = JSON.parse(msg.content.toString());
        console.log(`Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${data}`);
        await video_service_1.VideoService.update(data.id, { ...data });
        ack();
    });
};
exports.default = initVideoEvents;

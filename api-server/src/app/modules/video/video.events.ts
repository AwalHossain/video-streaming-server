/* eslint-disable @typescript-eslint/no-unused-vars */

import { Message } from "amqplib";
import { API_SERVER_EVENTS } from "../../../constants/event";
import RabbitMQ from "../../../shared/rabbitMQ";
import { VideoService } from "./video.service";

const initVideoEvents = () => {
  RabbitMQ.consume(
    API_SERVER_EVENTS.INSERT_VIDEO_METADATA_EVENT,
    async (msg: Message, ack) => {
      try {
        // Process the message
        console.log(msg.content.toString(), "msg.content.toString()");
        const data = JSON.parse(msg.content.toString());
        await VideoService.insertIntoDBFromEvent(data);
        // Acknowledge the message
        ack();
      } catch (error) {
        console.error("Error processing message:", error);
        // Optionally, you can reject the message, which will requeue it
        // channel.nack(msg);
      }
    }
  );

  // update metadata event
  RabbitMQ.consume(
    API_SERVER_EVENTS.UPDATE_METADATA_EVENT,
    async (msg: Message, ack) => {
      console.log(
        `Received the following message from VIDEO_processed_EVENT: ${msg.content.toString()}`
      );
      const data = JSON.parse(msg.content.toString());
      console.log(
        `Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${data}`
      );
      await VideoService.update(data.id, { ...data });

      ack();
    }
  );
  // update processed event
  RabbitMQ.consume(
    API_SERVER_EVENTS.VIDEO_PROCESSED_EVENT,
    async (msg: Message, ack) => {
      console.log(
        `Received the following message from VIDEO_processed_EVENT: ${msg.content.toString()}`
      );
      const data = JSON.parse(msg.content.toString());
      console.log(
        `Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${data}`
      );
      await VideoService.updateHistory(data.id, data.history);

      ack();
    }
  );

  // update thumbnail
  RabbitMQ.consume(
    API_SERVER_EVENTS.VIDEO_THUMBNAIL_GENERATED_EVENT,
    async (msg: Message, ack) => {
      console.log(
        `Received the following message from VIDEO_thumbnail_EVENT: ${msg.content.toString()}`
      );
      const data = JSON.parse(msg.content.toString());
      console.log(
        `Received the following message from VIdeo_thumbnail_CONVERTED_EVENT: ${data}`
      );
      await VideoService.updateHistory(data.id, data.history);

      ack();
    }
  );

  // update HLS converted
  RabbitMQ.consume(
    API_SERVER_EVENTS.VIDEO_HLS_CONVERTED_EVENT,
    async (msg: Message, ack) => {
      console.log(
        `Received the following message from VIDEO_published_EVENT: ${msg.content.toString()}`
      );
      const data = JSON.parse(msg.content.toString());
      console.log(
        `Received the following message from VIDEO_published_EVENT: ${data}`
      );
      await VideoService.updateHistory(data.id, data.history);

      ack();
    }
  );

  // update published
  RabbitMQ.consume(
    API_SERVER_EVENTS.VIDEO_PUBLISHED_EVENT,
    async (msg: Message, ack) => {
      console.log(
        `Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${msg.content.toString()}`
      );
      const data = JSON.parse(msg.content.toString());
      console.log(
        `Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${data}`
      );
      await VideoService.update(data.id, { ...data });

      ack();
    }
  );
};

export default initVideoEvents;

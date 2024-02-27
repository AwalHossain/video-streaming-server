/* eslint-disable @typescript-eslint/no-unused-vars */

import { Message } from "amqplib";
import RabbitMQ from "../../../shared/rabbitMQ";
import { EVENT } from "../../events/event.constants";
import { VideoService } from "./video.service";

const initVideoEvents = () => {
  // redisSubClient.subscribe(EVENT.INSERT_VIDEO_METADATA_EVENT, (err, count) => {
  //   if (err) {
  //     console.log("Error in initVideoEvents", err);
  //   }
  //   console.log("Subscribed to initVideoEvents", count);
  // });

  // redisSubClient.subscribe(EVENT.GET_VIDEO_METADATA_EVENT, (err, count) => {
  //   if (err) {
  //     console.log("Error in initVideoEvents", err);
  //   }
  //   console.log("Subscribed to initVideoEvents", count);
  // });

  // redisSubClient.subscribe(EVENT.VIDEO_PROCESSED_EVENT, (err, count) => {
  //   if (err) {
  //     console.log("Error in initVideoEvents", err);
  //   }
  //   console.log("Subscribed to initVideoEvents", count);
  // });

  // redisSubClient.subscribe(
  //   EVENT.VIDEO_THUMBNAIL_GENERATED_EVENT,
  //   (err, count) => {
  //     if (err) {
  //       console.log("Error in initVideoEvents", err);
  //     }
  //     console.log("Subscribed to initVideoEvents", count);
  //   }
  // );

  // redisSubClient.subscribe(EVENT.VIDEO_HLS_CONVERTED_EVENT, (err, count) => {
  //   if (err) {
  //     console.log("Error in initVideoEvents", err);
  //   }
  //   console.log("Subscribed to initVideoEvents", count);
  // });

  // redisSubClient.subscribe(
  //   EVENT.UPLODED_VIDEO_PUBLISHED_EVENT,
  //   (err, count) => {
  //     if (err) {
  //       console.log("Error in initVideoEvents", err);
  //     }
  //     console.log("Subscribed to initVideoEvents", count);
  //   }
  // );

  // redisSubClient.subscribe(EVENT.UPDATA_VIDEO_METADATA_EVENT, (err, count) => {
  //   if (err) {
  //     console.log("Error in initVideoEvents", err);
  //   }
  //   console.log("Subscribed to initVideoEvents", count);
  // });

  // redisSubClient.on("message", async (channel, message) => {
  //   if (channel === EVENT.INSERT_VIDEO_METADATA_EVENT) {
  //     const data = JSON.parse(message);
  //     console.log(
  //       `Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${data}`
  //     );
  //     await VideoService.insertIntoDBFromEvent(data);
  //   }

  //   if (channel === EVENT.VIDEO_PROCESSED_EVENT) {
  //     console.log(
  //       `Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${message}`
  //     );
  //     const data = JSON.parse(message);
  //     console.log(
  //       `Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${data}`
  //     );
  //     await VideoService.updateHistory(data.id, data.history);
  //   }

  //   if (channel === EVENT.VIDEO_THUMBNAIL_GENERATED_EVENT) {
  //     console.log(
  //       `Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${message}`
  //     );
  //     const data = JSON.parse(message);
  //     console.log(
  //       `Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${data}`
  //     );
  //     await VideoService.updateHistory(data.id, data.history);
  //   }

  //   if (channel === EVENT.VIDEO_HLS_CONVERTED_EVENT) {
  //     console.log(
  //       `Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${message}`
  //     );
  //     const data = JSON.parse(message);
  //     console.log(
  //       `Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${data}`
  //     );
  //     await VideoService.updateHistory(data.id, data.history);
  //   }

  //   if (channel === EVENT.UPLODED_VIDEO_PUBLISHED_EVENT) {
  //     console.log(
  //       `Received the following message from VIDEO_HLS_CONVERTED_EVENT: ${message}`
  //     );
  //     console.log(
  //       `Received the following message from UPLODED_VIDEO_PUBLISHED_EVENT: ${message}`
  //     );
  //     const data = JSON.parse(message);
  //     await VideoService.update(data.id, data.history);
  //   }

  //   // if (channel === EVENT.UPDATA_VIDEO_METADATA_EVENT) {
  //   //   console.log(
  //   //     `Received the following message from UPDATA_VIDEO_METADATA_EVENT: ${message}`
  //   //   );
  //   //   const data = JSON.parse(message);
  //   //   await VideoService.updateHistory(data.id, {
  //   //     history: data.history,
  //   //     ...data.rest,
  //   //   });
  //   // }
  // });

  const queue = EVENT.INSERT_VIDEO_METADATA_EVENT;

  // Ensure the queue is declared before consuming from it

  RabbitMQ.consume(
    EVENT.INSERT_VIDEO_METADATA_EVENT,
    async (msg: Message, ack) => {
      try {
        // Process the message
        const data = JSON.parse(msg.content.toString());
        const correlationId = msg.properties.correlationId;
        await VideoService.insertIntoDBFromEvent({ data, correlationId });
        // Acknowledge the message
        ack();
      } catch (error) {
        console.error("Error processing message:", error);
        // Optionally, you can reject the message, which will requeue it
        // channel.nack(msg);
      }
    }
  );
};

export default initVideoEvents;

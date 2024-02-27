import { Message } from 'amqplib';
import { NOTIFY_EVENTS } from '../constants/notify';
import { io } from '../server';
import { logger } from '../shared/logger';
import RabbitMQ from '../shared/rabbitMQ';

export const setupRabbitMQConsumers = async () => {
  // Listen for all events from the Video Conversion Server
  for (const event of Object.values(NOTIFY_EVENTS)) {
    RabbitMQ.consume(event, (message: Message, ack) => {
      try {
        const parsedMessage = JSON.parse(message.content.toString());
        console.log('checking data', parsedMessage);

        const { userId, ...data } = parsedMessage;
        logger.info(`Emitting event ${event} to user ${userId}`);
        io.to(userId).emit(event, data);
        ack();
      } catch (error) {
        logger.error(`Failed to process message for event ${event}:`, error);
      }
    });
  }
};

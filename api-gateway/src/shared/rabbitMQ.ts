import client, { Channel, Connection, Message } from 'amqplib';
import { errorLogger, logger } from './logger';

interface Options {
  expiration?: string;
  persistent?: boolean;
  priority?: number;
  correlationId?: string;
  replyTo?: string;
  // Add more properties as needed
}

class RabbitMQConnection {
  connection!: Connection;
  channel!: Channel;
  private connected!: boolean;

  async connect(): Promise<void> {
    if (this.connected && this.channel) return;

    try {
      logger.info('⏳Connecting to RabbitMQ');
      this.connection = await client.connect(process.env.RABBITMQ_URL);

      this.connection.on('error', (error) => {
        errorLogger.error('RabbitMQ connection error', error);
        // Try to reconnect
        setTimeout(this.connect, 3000);
      });

      this.connection.on('close', () => {
        this.connected = false;
        logger.info('RabbitMQ connection closed');
        // Try to reconnect
        setTimeout(this.connect, 3000);
      });

      logger.info(`✅ RabbitMQ connected successfully`);

      this.channel = await this.connection.createChannel();

      logger.info(`🛸 RabbitMQ channel created successfully`);
      this.connected = true;
    } catch (error) {
      errorLogger.error('Error connecting to RabbitMQ', error);
    }
  }

  // Send message to queue
  async sendToQueue(queue: string, message: Message, options?: Options) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      this.channel.assertQueue(queue, {
        durable: false,
      });

      this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        options,
      );
    } catch (error) {
      errorLogger.error('Error sending message to queue', error);
    }
  }

  // Consume message from queue

  async consume(
    queue: string,
    callback: (message: Message, ack: () => void) => void,
  ) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      this.channel.assertQueue(queue, {
        durable: false,
      });

      this.channel.consume(queue, (message) => {
        if (message) {
          const ack = () => this.channel.ack(message);
          callback(message, ack);
        }
      });
    } catch (error) {
      errorLogger.error('Error consuming message from queue', error);
    }
  }
}

const RabbitMQ = new RabbitMQConnection();

export default RabbitMQ;

/* eslint-disable @typescript-eslint/no-explicit-any */
import client, { Channel, Connection, Message } from "amqplib";
import { errorLogger, logger } from "./logger";

// Interface for consumer registration
interface ConsumerRegistration {
  queue: string;
  callback: (message: Message, ack: () => void) => void;
}

interface Options {
  expiration?: string;
  persistent?: boolean;
  priority?: number;
  correlationId?: string;
  replyTo?: string;
  // Add more properties as needed
}

class RabbitMQConnection {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private isConnecting: boolean = false;
  private consumers: ConsumerRegistration[] = []; // Track consumers
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private currentRetryDelay = 3000; // Initial retry delay ms
  private maxRetryDelay = 30000; // Max retry delay ms

  // --- Public method to initiate the connection loop ---
  public async initialize(): Promise<void> {
    if (this.connection || this.isConnecting) {
      logger.info('RabbitMQ connection already initialized or in progress.');
      return;
    }
    await this.connectWithRetry();
  }

  // --- Internal connection logic with retry ---
  private async connectWithRetry(): Promise<void> {
    if (this.isConnecting || this.connection) return; // Prevent overlap

    this.isConnecting = true;
    logger.info(`⏳ Attempting to connect to RabbitMQ (delay: ${this.currentRetryDelay}ms)...`);

    try {
      this.connection = await client.connect(process.env.RABBITMQ_URL);
      this.isConnecting = false; // Connected before setting up listeners/channel
      logger.info("✅ RabbitMQ connected successfully");
      this.currentRetryDelay = 3000; // Reset delay on successful connect

      this.connection.on("error", (error) => {
        errorLogger.error("RabbitMQ connection error:", error);
        // Error handler primarily logs, close handler triggers reconnect
      });

      this.connection.on("close", () => {
        logger.warn("RabbitMQ connection closed. Attempting to reconnect...");
        this.handleDisconnect();
      });

      // Create channel *after* connection is stable
      this.channel = await this.connection.createChannel();
      logger.info("🛸 RabbitMQ channel created successfully");

      // --- Re-establish all registered consumers ---
      await this.setupConsumers();

    } catch (error) {
      errorLogger.error("Error connecting to RabbitMQ:", error);
      this.isConnecting = false; // Allow retry attempt
      this.handleDisconnect(); // Schedule a retry
    }
  }

  // --- Handle disconnection and schedule retry ---
  private handleDisconnect(): void {
    // Clear existing resources
    this.connection = null;
    this.channel = null;
    this.isConnecting = false; // Ensure we can try again

    // Clear any existing timeout to prevent multiple loops
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Schedule retry with exponential backoff
    logger.info(`Scheduling RabbitMQ reconnect attempt in ${this.currentRetryDelay}ms`);
    this.reconnectTimeout = setTimeout(async () => {
      await this.connectWithRetry();
    }, this.currentRetryDelay);

    // Increase delay for next time, up to max
    this.currentRetryDelay = Math.min(this.currentRetryDelay * 2, this.maxRetryDelay);
  }

  // --- Setup registered consumers on the current channel ---
  private async setupConsumers(): Promise<void> {
    if (!this.channel) {
      errorLogger.error("Cannot setup consumers, channel is not available.");
      return;
    }
    logger.info(`Setting up ${this.consumers.length} registered consumers...`);
    for (const registration of this.consumers) {
      try {
        await this.channel.assertQueue(registration.queue, { durable: false });
        this.channel.consume(registration.queue, (message) => {
          if (message && this.channel) { // Check channel still exists
            const ack = () => {
              if (this.channel) { // Check channel again before acking
                 try { this.channel.ack(message); } catch(ackErr){ errorLogger.error('Error acking message:', ackErr); }
              } else { errorLogger.warn('Cannot ack message, channel closed.'); }
            };
            registration.callback(message, ack);
          }
        });
        logger.info(`   -> Consumer setup for queue: ${registration.queue}`);
      } catch (error) {
        errorLogger.error(`Error setting up consumer for queue ${registration.queue}:`, error);
        // Optionally decide if this should trigger a full reconnect
      }
    }
  }

  // --- Ensure connection and channel are ready before operations ---
  private async ensureConnected(): Promise<void> {
     if (!this.connection || !this.channel) {
       logger.warn("Connection/Channel not ready. Waiting...");
       // This simple approach waits, but a more robust solution might involve a short delay/retry
       // or throwing an error immediately if not connected after initialization attempt.
       // For now, we rely on initialize() having been called.
       if(!this.isConnecting && !this.connection) {
           // If connection is totally lost and not already trying, attempt reconnect
           await this.connectWithRetry();
       }
       // If still not ready after attempt, throw error
       if (!this.connection || !this.channel) {
            throw new Error("RabbitMQ connection/channel not available after check.");
       }
     }
  }

  // --- Send message to queue ---
  async sendToQueue(queue: string, message: any, options?: Options): Promise<void> {
    try {
      await this.ensureConnected(); // Wait/check for connection
      // Assert queue just before sending (optional, could be done once at setup)
      await this.channel!.assertQueue(queue, { durable: false });
      this.channel!.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        options
      );
      // logger.debug(`Sent message to queue ${queue}`); // Optional debug log
    } catch (error) {
      errorLogger.error(`Error sending message to queue ${queue}:`, error);
      // Consider if this should trigger a reconnect attempt
      // this.handleDisconnect(); // <-- Uncomment cautiously if sending failure implies connection issue
      throw error;
    }
  }

  // --- Register a consumer ---
  async consume(
    queue: string,
    callback: (message: Message, ack: () => void) => void
  ): Promise<void> {
     logger.info(`Registering consumer for queue: ${queue}`);
     // Store the registration details
     this.consumers.push({ queue, callback });

     // If channel is already available, set up this consumer immediately
     if (this.channel) {
        logger.info(`Channel available, setting up consumer immediately for queue: ${queue}`);
        try {
          await this.channel.assertQueue(queue, { durable: false });
          this.channel.consume(queue, (message) => {
            if (message && this.channel) {
              const ack = () => {
                 if (this.channel) {
                   try { this.channel.ack(message); } catch(ackErr){ errorLogger.error('Error acking message:', ackErr); }
                 } else { errorLogger.warn('Cannot ack message, channel closed.'); }
              };
              callback(message, ack);
            }
          });
        } catch (error) {
          errorLogger.error(`Error setting up immediate consumer for queue ${queue}:`, error);
           // If immediate setup fails, it might indicate a channel issue, potentially trigger reconnect
           // this.handleDisconnect(); // <-- Uncomment cautiously
        }
     } else {
        logger.warn(`Channel not yet available for queue ${queue}. Consumer will be set up after connection.`);
     }
  }
}

const RabbitMQ = new RabbitMQConnection();
// --- Important: Call initialize() once during application startup ---
// e.g., in your main server bootstrap function:
// RabbitMQ.initialize().catch(err => /* handle initial connection failure */);

export default RabbitMQ;

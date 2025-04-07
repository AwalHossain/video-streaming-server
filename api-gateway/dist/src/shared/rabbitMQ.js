"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const amqplib_1 = __importDefault(require("amqplib"));
const logger_1 = require("./logger");
class RabbitMQConnection {
    constructor() {
        this.reconnecting = false;
    }
    async connect() {
        if (this.connected && this.channel)
            return;
        if (this.reconnecting)
            return; // Prevent multiple reconnection attempts
        try {
            this.reconnecting = true;
            logger_1.logger.info('⏳Connecting to RabbitMQ');
            this.connection = await amqplib_1.default.connect(process.env.RABBITMQ_URL);
            this.connection.on('error', (error) => {
                if (!this.reconnecting) {
                    logger_1.errorLogger.error('RabbitMQ connection error', error);
                    // Try to reconnect
                    setTimeout(() => this.connect(), 3000);
                }
            });
            this.connection.on('close', () => {
                this.connected = false;
                if (!this.reconnecting) {
                    logger_1.logger.info('RabbitMQ connection closed');
                    // Try to reconnect
                    setTimeout(() => this.connect(), 3000);
                }
            });
            logger_1.logger.info(`✅ RabbitMQ connected successfully`);
            this.channel = await this.connection.createChannel();
            logger_1.logger.info(`🛸 RabbitMQ channel created successfully`);
            this.connected = true;
            this.reconnecting = false; // Reset reconnecting flag
        }
        catch (error) {
            this.reconnecting = false; // Reset the flag if an error occurs
            logger_1.errorLogger.error('Error connecting to RabbitMQ', error);
            throw error; // Re-throw the error
        }
    }
    // Send message to queue
    async sendToQueue(queue, message, options) {
        try {
            if (!this.channel) {
                await this.connect();
            }
            this.channel.assertQueue(queue, {
                durable: false,
            });
            this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), options);
        }
        catch (error) {
            logger_1.errorLogger.error('Error sending message to queue', error);
            throw error; // Re-throw the error
        }
    }
    // Consume message from queue
    async consume(queue, callback) {
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
        }
        catch (error) {
            logger_1.errorLogger.error('Error consuming message from queue', error);
            throw error; // Re-throw the error
        }
    }
}
const RabbitMQ = new RabbitMQConnection();
exports.default = RabbitMQ;
//# sourceMappingURL=rabbitMQ.js.map
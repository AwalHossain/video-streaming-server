"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRabbitMQConsumers = void 0;
const notify_1 = require("../constants/notify");
const server_1 = require("../server");
const logger_1 = require("../shared/logger");
const rabbitMQ_1 = __importDefault(require("../shared/rabbitMQ"));
const setupRabbitMQConsumers = async () => {
    // Listen for all events from the Video Conversion Server
    for (const event of Object.values(notify_1.NOTIFY_EVENTS)) {
        rabbitMQ_1.default.consume(event, (message, ack) => {
            try {
                const parsedMessage = JSON.parse(message.content.toString());
                console.log('checking data', parsedMessage);
                const { userId, ...data } = parsedMessage;
                logger_1.logger.info(`Emitting event ${event} to user ${userId}`);
                server_1.io.to(userId).emit(event, data);
                ack();
            }
            catch (error) {
                logger_1.logger.error(`Failed to process message for event ${event}:`, error);
            }
        });
    }
};
exports.setupRabbitMQConsumers = setupRabbitMQConsumers;
//# sourceMappingURL=index.js.map
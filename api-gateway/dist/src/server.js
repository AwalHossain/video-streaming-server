"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const logger_1 = require("./shared/logger");
const rabbitMQ_1 = __importDefault(require("./shared/rabbitMQ"));
const socket_1 = require("./socket");
const PORT = config_1.default.port || 8000;
const server = http_1.default.createServer(app_1.default);
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
exports.io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    socket.join(userId);
    console.log(`User ${userId} connected`);
    socket.on('disconnect', () => {
        logger_1.logger.info(`User ${userId} disconnected`);
    });
});
async function bootstrap() {
    try {
        await rabbitMQ_1.default.connect();
        await (0, socket_1.setupRabbitMQConsumers)();
        server.listen(PORT, async () => {
            logger_1.logger.info(`listening on port ${PORT}`);
            logger_1.logger.info('application started');
        });
        // process.on('SIGTERM', () => {
        //   logger.info('SIGTERM received');
        //   if (server) {
        //     server.close();
        //   }
        // });
    }
    catch (error) {
        logger_1.errorLogger.error('Error connecting to Server', error);
    }
}
bootstrap();
//# sourceMappingURL=server.js.map
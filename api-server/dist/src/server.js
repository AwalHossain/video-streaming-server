"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = void 0;
// always suggest for typescript
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const events_1 = __importDefault(require("./app/events"));
const config_1 = __importDefault(require("./config"));
const logger_1 = require("./shared/logger");
const rabbitMQ_1 = __importDefault(require("./shared/rabbitMQ"));
const PORT = config_1.default.port || 8001;
exports.server = http_1.default.createServer(app_1.default);
exports.io = new socket_io_1.Server(exports.server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
exports.io.on("connection", (socket) => {
    // get the user's id
    const userId = socket.handshake.query.userId;
    // Log a message
    logger_1.logger.info(`User ${userId} connected`);
    // Join the user to the room
    socket.join(userId);
    socket.on("disconnect", () => {
        logger_1.logger.info(`User ${userId} disconnected`);
    });
});
async function bootstrap() {
    try {
        await rabbitMQ_1.default.connect();
        (0, events_1.default)();
        exports.server = app_1.default.listen(PORT, async () => {
            logger_1.logger.info(`listening on port ${PORT}`);
            console.log("listening on port", PORT);
            // console.log("config.mongoUrl", config.mongoUrl);
            const db = await mongoose_1.default.connect(config_1.default.mongoUrl);
            logger_1.logger.info("database connected", db.connection.readyState);
            logger_1.logger.info("application setup completed successfully");
            logger_1.logger.info("application started", new Date().toTimeString());
        });
    }
    catch (error) {
        logger_1.errorLogger.error("Error connecting to Redis", error);
    }
}
bootstrap();

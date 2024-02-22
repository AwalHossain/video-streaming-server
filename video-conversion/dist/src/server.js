"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const setupQueue_1 = __importDefault(require("./setupQueue"));
const PORT = 5000;
const server = http_1.default.createServer(app_1.default);
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
exports.io.on('connection', (socket) => {
    // get the user's id
    const userId = socket.handshake.query.userId;
    // Log a message
    console.log(`User ${userId} connected`);
    // Join the user to the room
    socket.join(userId);
    socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
    });
});
server.listen(PORT, async () => {
    console.log(`listening on port ${PORT}`);
    console.log('application setup completed successfully');
    await (0, setupQueue_1.default)();
    console.log('application started', new Date().toTimeString());
});

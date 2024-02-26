import http from 'http';
import { Server } from 'socket.io';
import { io as clientIo } from 'socket.io-client';
import app from './app';
import { NOTIFY_EVENTS } from './constants/notify';
import { errorLogger, logger } from './shared/logger';
import { redisConnection } from './shared/redis';

const PORT: number = 8001;

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const videoConversionNamespace = io.of('/video-conversion');

videoConversionNamespace.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  // if (!userId) {
  //   return;
  // }
  socket.join(userId);

  logger.info(`User ${userId} connected`);

  // Connect to the Video Conversion Server for this user
  const conversionServerSocket = clientIo(
    `http://localhost:8000?userId=${userId}`,
  );

  // Listen for all events from the Video Conversion Server
  for (const event of Object.values(NOTIFY_EVENTS)) {
    conversionServerSocket.on(event, (data) => {
      console.log('event', event, data);

      // Forward the event to the client
      socket.to(userId).emit(event, data);
    });
  }

  socket.on('disconnect', () => {
    logger.info(`User ${userId} disconnected`);
    conversionServerSocket.disconnect();
  });
});

async function bootstrap() {
  try {
    server.listen(PORT, async () => {
      redisConnection.on('error', (error) =>
        errorLogger.log('RedisError', error),
      );
      redisConnection.on('connect', () => logger.info('Redis Connected'));
      logger.info(`listening on port ${PORT}`);
      logger.info('application started');
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received');
      if (server) {
        server.close();
      }
    });
  } catch (error) {
    errorLogger.error('Error connecting to Server', error);
  }
}

bootstrap();

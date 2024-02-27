import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { errorLogger, logger } from './shared/logger';
import RabbitMQ from './shared/rabbitMQ';
import { setupRabbitMQConsumers } from './socket';

const PORT: number = 8001;

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  socket.join(userId);
  console.log(`User ${userId} connected`);

  socket.on('disconnect', () => {
    logger.info(`User ${userId} disconnected`);
  });
});

async function bootstrap() {
  try {
    await RabbitMQ.connect();
    await setupRabbitMQConsumers();
    server.listen(PORT, async () => {
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

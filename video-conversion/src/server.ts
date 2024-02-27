import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import subscribeToEvents from './app/events';
import { errorLogger, logger } from './shared/logger';
import rabbitMQConnection from './shared/rabbitMQ';
import { setupAllQueueEvent } from './worker/jobWorker';

const PORT: number = 8000;

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  // get the user's id

  const userId = socket.handshake.query.userId;
  if (!userId) {
    return;
  }
  // Log a message
  logger.info(`User ${userId} connected`);

  // Join the user to the room
  socket.join(userId);

  socket.on('disconnect', () => {
    logger.info(`User ${userId} disconnected`);
  });
});

async function bootstrap() {
  try {
    subscribeToEvents();
    await rabbitMQConnection.connect();

    server.listen(PORT, async () => {
      logger.info(`listening on port ${PORT}`);
      logger.info('application started');

      // calling the setupAllQueueEvent function to run the worker
      setupAllQueueEvent();
    });
  } catch (error) {
    errorLogger.error('Error connecting to Server', error);
  }
}

bootstrap();

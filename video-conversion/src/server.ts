import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import subscribeToEvents from './app/events';
import { setupAllQueueEvent } from './worker/jobWorker';

const PORT: number = 8000;

let server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
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

async function bootstrap() {
  try {
    subscribeToEvents();

    server = app.listen(PORT, async () => {
      console.log(`listening on port ${PORT}`);
      console.log('application setup completed successfully');
      setupAllQueueEvent();
      console.log('application started', new Date().toTimeString());
    });
  } catch (error) {
    console.error('Error connecting to Redis', error);
  }
}

bootstrap();

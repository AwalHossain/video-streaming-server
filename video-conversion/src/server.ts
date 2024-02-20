import http from 'http';
import { Server } from 'socket.io';
import app from './app';

const PORT: number = 5000;

const server = http.createServer(app);

const io = new Server(server, {
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

server.listen(PORT, async () => {
  console.log(`listening on port ${PORT}`);
  console.log('application setup completed successfully');

  console.log('application started', new Date().toTimeString());
});

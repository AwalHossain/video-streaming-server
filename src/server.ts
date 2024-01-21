// always suggest for typescript
import http from "http";
import { Server } from "socket.io";
import app from "./app";

import mongoose from "mongoose";
import { setupAllQueueEvent } from "./modules/queues/worker";

const PORT: number = 5000;
const server = http.createServer(app);


export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


io.on("connection", (socket) => {
  // get the user's id


  const userId = socket.handshake.query.userId;

  // Log a message
  console.log(`User ${userId} connected`);

  // Join the user to the room
  socket.join(userId);


  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected`);
  });

});


server.listen(PORT, async () => {
  console.log(`listening on port ${PORT}`);
  // initializeMongoDB();



  await mongoose.connect(process.env.MONGO_URL)
  // await setup();
  setupAllQueueEvent();
  console.log("application setup completed successfully");

  console.log("application started", new Date().toTimeString());
});

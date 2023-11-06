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

// export const setup = async () => {
//   // await updateSchema(db);
//   // setupRoutes(app);
//   console.log("setup completed.....");
//   listenQueueEvent(NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED);

// };

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

});


server.listen(PORT, async () => {
  console.log(`listening on port ${PORT}`);
  // initializeMongoDB();



  await mongoose.connect(process.env.MONGO_URL)
  // await setup();
  setupAllQueueEvent();
  console.log("application setup completed");

  console.log("application started", new Date().toTimeString());
});

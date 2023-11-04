// always suggest for typescript
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import evenEmitter from "./event-manager";

import mongoose from "mongoose";
import { NOTIFY_EVENTS } from "./modules/queues/constants";
import { listenQueueEvent } from "./modules/queues/worker";

const PORT: number = 5000;
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const setup = async () => {
  // await updateSchema(db);
  // setupRoutes(app);

  listenQueueEvent(NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED);
  evenEmitter.on(NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED, (data) => {
    io.emit("hello", data);
  });

  evenEmitter.on(NOTIFY_EVENTS.NOTIFY_UPLOAD_PROGRESS, (data) => {
    io.emit("upload", data);
  });

  evenEmitter.on(NOTIFY_EVENTS.NOTIFY_VIDEO_UPLOADED, (data) => {
    io.emit("upload", data);
  });

  evenEmitter.on(NOTIFY_EVENTS.NOTIFY_VIDEO_METADATA_SAVED, (data) => {
    io.emit("upload", data);
  });

  evenEmitter.on(NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSING, (data) => {
    io.emit("upload", data);
  });

};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

});

// server.listen(4000, () => {
//   console.log("listening on *:4000");    P
// });


// Import necessary modules and other code as needed



server.listen(PORT, async () => {
  console.log(`listening on port ${PORT}`);
  // initializeMongoDB();

  await mongoose.connect(process.env.MONGO_URL)
  await setup();
  console.log("application setup completed");

  // app.use("/", (req: Request, res: Response) => {
  //   console.log(`request received at ${new Date()}`);
  //   console.log("req", req.body);
  //   res.send(`request received at ${new Date()}`);
  // });

  console.log("application started", new Date().toTimeString());
});

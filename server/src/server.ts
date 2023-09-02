// always suggest for typescript
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import evenEmitter from "./event-manager";
import MongoManager from "./modules/db/mongo";

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
  }
  );
};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  // setInterval(() => {
  io.emit("msg", Date.now().toString());
  // socket.on("mn", (data) => {
  //   console.log("data", data);
  // });
  // }, 5000);
  // io.emit("message", "hello world");
});

// server.listen(4000, () => {
//   console.log("listening on *:4000");    P
// });

server.listen(PORT, async () => {
  console.log(`listening on port ${PORT}`);
  await MongoManager.connect();
  await setup();
  console.log("application setup completed");

  // app.use("/", (req: Request, res: Response) => {
  //   console.log(`request received at ${new Date()}`);
  //   console.log("req", req.body);
  //   res.send(`request received at ${new Date()}`);
  // });

  console.log("application started", new Date().toTimeString());
});

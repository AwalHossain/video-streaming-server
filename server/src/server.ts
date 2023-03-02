// always suggest for typescript
import http from "http";
import { Db } from "mongodb";
import { Server } from "socket.io";
import app from "./app";
import { setupRoutes } from "./modules/models/video/controller";
import { updateSchema } from "./modules/models/video/schema";

const PORT: number = 4000;
const server = http.createServer(app);
const io = new Server(server);

const setup = async (db: Db) => {
  await updateSchema(db);
  setupRoutes(app);
};

io.on("connection", (socket) => {
  console.log("a user connected");
});

server.listen(4000, () => {
  console.log("listening on *:4000");
});

// server.listen(PORT, async () => {
//   console.log(`listening on port ${PORT}`);
//   const db = await connect();
//   await setup(db);
//   console.log("application setup completed");

//   app.use("/", (req: Request, res: Response) => {
//     console.log(`request received at ${new Date()}`);
//     console.log("req", req.body);
//     res.send(`request received at ${new Date()}`);
//   });

//   console.log("application started", new Date().toTimeString());
// });

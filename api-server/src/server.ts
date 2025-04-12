// always suggest for typescript
import http from "http";
import { Server } from "socket.io";
import app from "./app";

import mongoose from "mongoose";
import subscribeToEvents from "./app/events";
import config from "./config";
import { errorLogger, logger } from "./shared/logger";
import RabbitMQ from "./shared/rabbitMQ";

const PORT: number = config.port as unknown as number || 8001;
export let server = http.createServer(app);

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
  logger.info(`User ${userId} connected`);

  // Join the user to the room
  socket.join(userId);

  socket.on("disconnect", () => {
    logger.info(`User ${userId} disconnected`);
  });
});

async function bootstrap() {
  try {
    await RabbitMQ.initialize().catch((error) => {
      errorLogger.error("Error connecting to RabbitMQ", error);
      process.exit(1);
    });
    subscribeToEvents();
    server = app.listen(PORT, async () => {
      logger.info(`listening on port ${PORT}`);
      console.log("listening on port", PORT);
      // console.log("config.mongoUrl", config.mongoUrl);
      const db = await mongoose.connect(config.mongoUrl);
      logger.info("database connected", db.connection.readyState);
      logger.info("application setup completed successfully");
      logger.info("application started", new Date().toTimeString());
    });
  } catch (error) {
    errorLogger.error("Error connecting to Redis", error);
  }
}

bootstrap();

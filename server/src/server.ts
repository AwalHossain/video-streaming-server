import { Request, Response } from "express";
import { Db } from "mongodb";
import app from "./app";
import { connect } from "./modules/db/mongo";
import { setupRoutes } from "./modules/models/video/controller";
import { updateSchema } from "./modules/models/video/schema";

const PORT: number = 4000;

const setup = async (db: Db) => {
  await updateSchema(db);
  setupRoutes(app);
};

app.listen(PORT, async () => {
  console.log(`listening on port ${PORT}`);
  const db = await connect();
  await setup(db);
  console.log("application setup completed");

  app.use("/", (req: Request, res: Response) => {
    console.log(`request received at ${new Date()}`);
    console.log("req", req.body);
    res.send(`request received at ${new Date()}`);
  });

  console.log("application started", new Date().toTimeString());
});

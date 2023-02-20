import { Request, Response } from "express";
import app from "./app";
import { connect } from "./module/db/mongo";
import { setupRoutes } from './module/models/video/controller';
import updateSchema from './module/models/video/schema';

const port = 4000;


app.get("/", (req:Request, res:Response)=>{
    res.send("heelo")
})

const setup = async (db: any)=>{
    await updateSchema(db)
     setupRoutes(app)
}

app.listen(port, async ()=> {
    console.log("listening on localhost:" + port);
  const db =  await connect();
        await setup(db);
})
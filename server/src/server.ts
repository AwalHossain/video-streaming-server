import { Request, Response } from "express";
import app from "./app";
import { connect } from "./module/db/mongo";


const port = 4000;


app.get("/", (req:Request, res:Response)=>{
    res.send("heelo")
})

app.listen(port, async ()=> {
    console.log("listening on localhost:" + port);


    await connect();
})
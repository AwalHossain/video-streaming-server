import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";

const app: Express = express();

dotenv.config();

app.use(express.json());
app.use(compression());
app.use(cors());

export default app;

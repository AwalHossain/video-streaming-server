import compression from "compression";
import cors from "cors";
import express, { Express } from "express";

const app: Express = express();

app.use(express.json());
app.use(compression());
app.use(cors());

export default app;

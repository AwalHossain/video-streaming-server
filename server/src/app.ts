import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import router from "./routes";
const app: Express = express();

const BASE_URL = "/api/v1";

dotenv.config();

app.use(express.json());
app.use(compression());
app.use(cors());

app.use(`/api/v1`, router)

//handle not found
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
      success: false,
      message: 'Not Found',
      errorMessages: [
        {
          path: req.originalUrl,
          message: 'API Not Found',
        },
      ],
    });
    next();
  });

export default app;

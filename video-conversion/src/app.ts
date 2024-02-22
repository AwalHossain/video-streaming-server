import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, NextFunction, Request, Response } from 'express';

// import globalErrorHandler from "./app/middleware/globalErrorhandler";

import router from './app/routes/index';
const app: Express = express();

dotenv.config();

app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(`/`, router);

// app.use(globalErrorHandler)

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

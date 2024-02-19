import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import session from 'express-session';
import passport from "passport";
import globalErrorHandler from "./app/middleware/globalErrorhandler";
import { passportConfig } from "./config/passport-config";
import router from "./routes";
const app: Express = express();


dotenv.config();



app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use(express.json());
app.use(session({
  name: "__session",
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
}));
app.use(cookieParser())
app.use(compression());
app.use(cors({
  origin: [process.env.CLIENT_URL1!, process.env.CLIENT_URL2!],
  credentials: true
}));

passportConfig();


app.use(`/api/v1`, router)


app.use(globalErrorHandler)

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

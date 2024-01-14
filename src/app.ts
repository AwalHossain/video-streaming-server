import compression from "compression";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import globalErrorHandler from "./app/middleware/globalErrorhandler";
import { passportConfig } from "./config/passport-config";
import router from "./routes";

const app: Express = express();


const BASE_URL = "/api/v1";

dotenv.config();

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true for production
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    domain: ".ondigitalocean.app"
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL!,
    autoRemove: 'interval',
  })
}))

app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate(
  'session'
))

app.use(express.json());
app.use(cookieParser())
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL!,
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

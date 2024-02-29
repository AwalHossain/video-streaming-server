import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, NextFunction, Request, Response } from 'express';
// import globalErrorHandler from "./app/middleware/globalErrorhandler";
// import router from './app/routes/index';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import router from './app/routes';
import config from './config';
import { errorLogger } from './shared/logger';
dotenv.config();

const app: Express = express();

Sentry.init({
  dsn: config.sentry.dsn,
  environment: 'devlopment',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,

  tracePropagationTargets: ['all'],
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get('/test', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.get('/debug-sentry', function mainHandler() {
  throw new Error('My first Sentry error!');
});

app.use(`/api/v1`, router);

app.use(globalErrorHandler);

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

process.on('unhandledRejection', (error) => {
  Sentry.captureException(error);
  errorLogger.error('Unhandled Rejection at:', error);

  Sentry.flush(2000).then(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (error) => {
  Sentry.captureException(error);
  errorLogger.error('There was an uncaught error', error);

  Sentry.flush(2000).then(() => {
    process.exit(1);
  });
});

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

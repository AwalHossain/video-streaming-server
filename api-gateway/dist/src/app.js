"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Sentry = __importStar(require("@sentry/node"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
// import globalErrorHandler from "./app/middleware/globalErrorhandler";
// import router from './app/routes/index';
const globalErrorHandler_1 = __importDefault(require("./app/middleware/globalErrorHandler"));
const routes_1 = __importDefault(require("./app/routes"));
const logger_1 = require("./shared/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Sentry.init({
//   dsn: config.sentry.dsn,
//   environment: 'devlopment',
//   integrations: [
//     // enable HTTP calls tracing
//     new Sentry.Integrations.Http({ tracing: true }),
//     // enable Express.js middleware tracing
//     new Sentry.Integrations.Express({ app }),
//     new ProfilingIntegration(),
//   ],
//   // Performance Monitoring
//   tracesSampleRate: 1.0, //  Capture 100% of the transactions
//   // Set sampling rate for profiling - this is relative to tracesSampleRate
//   profilesSampleRate: 1.0,
//   tracePropagationTargets: ['all'],
// });
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: [process.env.CLIENT_URL1, process.env.CLIENT_URL2],
    credentials: true,
}));
app.get('/test', (req, res) => {
    res.send('Hello World!');
});
app.get('/debug-sentry', function mainHandler() {
    throw new Error('My first Sentry error!');
});
app.use(`/api/v1`, routes_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API Gateway is running',
    });
});
app.use(globalErrorHandler_1.default);
// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());
process.on('unhandledRejection', (error) => {
    Sentry.captureException(error);
    logger_1.errorLogger.error('Unhandled Rejection at:', error);
    Sentry.flush(2000).then(() => {
        process.exit(1);
    });
});
process.on('uncaughtException', (error) => {
    Sentry.captureException(error);
    logger_1.errorLogger.error('There was an uncaught error', error);
    Sentry.flush(2000).then(() => {
        process.exit(1);
    });
});
//handle not found
app.use((req, res, next) => {
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
exports.default = app;
//# sourceMappingURL=app.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../config"));
const apiError_1 = __importDefault(require("../../error/apiError"));
const handleCastErr_1 = __importDefault(require("../../error/handleCastErr"));
const handleValidation_1 = __importDefault(require("../../error/handleValidation"));
const logger_1 = require("../../shared/logger");
const globalErrorHandler = (error, req, res, next) => {
    config_1.default.env === "development"
        ? console.log(`🐱‍🏍 globalErrorHandler ~~`, { error })
        : logger_1.errorLogger.log(`🐱‍🏍 globalErrorHandler ~~`, error);
    let statusCode = 500;
    let message = "Something went wrong in api-server!";
    let errorMessages = [];
    if ((error === null || error === void 0 ? void 0 : error.name) === "ValidationError") {
        const simplifiedError = (0, handleValidation_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessages = simplifiedError.errorMessages;
    }
    else if ((error === null || error === void 0 ? void 0 : error.name) === "CastError") {
        const simplifiedError = (0, handleCastErr_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessages = simplifiedError.errorMessages;
    }
    else if (error instanceof apiError_1.default) {
        statusCode = error === null || error === void 0 ? void 0 : error.statusCode;
        message = error.message;
        errorMessages = (error === null || error === void 0 ? void 0 : error.message)
            ? [
                {
                    path: "",
                    message: error === null || error === void 0 ? void 0 : error.message,
                },
            ]
            : [];
    }
    else if (error instanceof Error) {
        message = error === null || error === void 0 ? void 0 : error.message;
        errorMessages = (error === null || error === void 0 ? void 0 : error.message)
            ? [
                {
                    path: "",
                    message: error === null || error === void 0 ? void 0 : error.message,
                },
            ]
            : [];
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorMessages,
        stack: config_1.default.env !== "production" ? error === null || error === void 0 ? void 0 : error.stack : undefined,
    });
};
exports.default = globalErrorHandler;

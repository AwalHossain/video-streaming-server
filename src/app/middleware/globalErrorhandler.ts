/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import config from '../../config';
import ApiError from '../../error/apiError';
import { IGenericErrorMessage } from '../../interface/error';


const globalErrorHandler: ErrorRequestHandler = (
    error,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    let statusCode = 500;
    let message = 'Something went wrong !';
    let errorMessages: IGenericErrorMessage[] = [];

    if (error?.name === 'ValidationError') {
        // const simplifiedError = handleValidationError(error);
        // statusCode = simplifiedError.statusCode;
        // message = simplifiedError.message;
        // errorMessages = simplifiedError.errorMessages;
    }
    // } else if (error?.name === 'CastError') {
    //     const simplifiedError = handleCastError(error);
    //     statusCode = simplifiedError.statusCode;
    //     message = simplifiedError.message;
    //     errorMessages = simplifiedError.errorMessages;
    // } 
    else if (error instanceof ApiError) {
        statusCode = error?.statusCode;
        message = error.message;
        errorMessages = error?.message
            ? [
                {
                    path: '',
                    message: error?.message,
                },
            ]
            : [];
    } else if (error instanceof Error) {
        message = error?.message;
        errorMessages = error?.message
            ? [
                {
                    path: '',
                    message: error?.message,
                },
            ]
            : [];
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorMessages,
        stack: config.env !== 'production' ? error?.stack : undefined,
    });
};

export default globalErrorHandler;
import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import config from "../../config";
import { sendResponse } from "../../shared/sendResponse";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    console.log("authHeader", authHeader);

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, config.jwtSecret, (err, user) => {
            console.log("user", user, err);

            if (err) {
                return sendResponse(res, {
                    statusCode: 401,
                    success: false,
                    message: 'Unauthorized',
                    data: null,
                });
            }

            req.user = user;
            next();
        });
    } else {
        return sendResponse(res, {
            statusCode: 401,
            success: false,
            message: 'Unauthorized',
            data: null,
        });
    }
};

export default isAuthenticated;
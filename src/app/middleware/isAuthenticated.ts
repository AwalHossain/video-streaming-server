//  passport authentication check

import { NextFunction, Request, Response } from "express";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.cookies, 'req.cookies');

    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errorMessages: [
            {
                path: req.originalUrl,
                message: 'You are not authorized to access this route',
            },
        ],
    });
}


export default isAuthenticated;
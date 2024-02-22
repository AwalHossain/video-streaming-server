// disable eslint for this file


import { NextFunction, Request, Response } from "express";
import ApiError from "../../errors/apiError";
import { verifyToken } from "../../utils/jwt";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    console.log("authHeader", authHeader);


        const token = authHeader.split(' ')[1];
    if(!token){
        throw new ApiError(401, 'Unauthorized');
    }

     // verify token
     let verifiedUser = null

     verifiedUser = verifyToken(token)

     req.user  = verifiedUser // add user to req object

     console.log(req.user, 'req.user');

     // use role as authguard
    next();
};

export default isAuthenticated;
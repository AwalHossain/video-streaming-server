import { NextFunction, Request, Response } from 'express';
import catchAsync from "../../../shared/catchAsyncError";
import { sendResponse } from "../../../shared/sendResponse";
import { UserService } from './user.service';



const registrationUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.register(req.body);

    req.login(result, (err) => {
        if (err) return next(err);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'User registered successfully !',
            data: result,
        });
    })

});


const loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.login(req.body);

    req.login(result, (err) => {
        if (err) return next(err);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'User Login successfully !',
            data: result,
        });
    })

});


const logoutUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }

        // delete cookie
        res.clearCookie('connect.sid', { path: '/' });

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'User Logout successfully !',
            data: {},
        });
    });
});

const getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.getUserById(req.params.id);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'User get successfully !',
        data: result,
    });

});

const updateUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.updateUserById(req.params.id, req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'User update successfully !',
        data: result,
    });

});


export const UserController = {
    registrationUser,
    loginUser,
    logoutUser,
    getUserById,
    updateUserById,
}
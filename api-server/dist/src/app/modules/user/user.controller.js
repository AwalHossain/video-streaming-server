"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const catchAsyncError_1 = __importDefault(require("../../../shared/catchAsyncError"));
const sendResponse_1 = require("../../../shared/sendResponse");
const jwt_1 = require("../../../utils/jwt");
const user_service_1 = require("./user.service");
const registrationUser = (0, catchAsyncError_1.default)(async (req, res, next) => {
    console.log("data from api-server controller", req.body);
    const result = await user_service_1.UserService.register(req.body);
    const token = (0, jwt_1.createToken)(result._id);
    console.log("token", token);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "User registered successfully with token!",
        data: {
            ...result.toObject(),
            accessToken: token,
        },
    });
});
const loginUser = (0, catchAsyncError_1.default)(async (req, res, next) => {
    console.log("data from api-server controller", req.body);
    const result = await user_service_1.UserService.login(req.body);
    const token = (0, jwt_1.createToken)(result._id);
    console.log("token", token);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "User registered successfully with token!",
        data: {
            ...result.toObject(),
            accessToken: token,
        },
    });
});
const logoutUser = (0, catchAsyncError_1.default)(async (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        // delete cookie
        res.clearCookie("connect.sid", { path: "/" });
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: 201,
            success: true,
            message: "User Logout successfully !",
            data: {},
        });
    });
});
const getUserById = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const result = await user_service_1.UserService.getUserById(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "User get successfully !",
        data: result,
    });
});
const updateUserById = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const result = await user_service_1.UserService.updateUserById(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "User update successfully !",
        data: result,
    });
});
exports.UserController = {
    registrationUser,
    loginUser,
    logoutUser,
    getUserById,
    updateUserById,
};

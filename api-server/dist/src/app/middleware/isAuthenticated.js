"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const sendResponse_1 = require("../../shared/sendResponse");
const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("authHeader", authHeader);
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret, (err, user) => {
            console.log("user", user, err);
            if (err) {
                return (0, sendResponse_1.sendResponse)(res, {
                    statusCode: 401,
                    success: false,
                    message: 'Unauthorized',
                    data: null,
                });
            }
            req.user = user;
            next();
        });
    }
    else {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: 401,
            success: false,
            message: 'Unauthorized',
            data: null,
        });
    }
};
exports.default = isAuthenticated;

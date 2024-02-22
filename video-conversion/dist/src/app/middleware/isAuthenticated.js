"use strict";
// disable eslint for this file
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiError_1 = __importDefault(require("../../errors/apiError"));
const jwt_1 = require("../../utils/jwt");
const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("authHeader", authHeader);
    const token = authHeader.split(' ')[1];
    if (!token) {
        throw new apiError_1.default(401, 'Unauthorized');
    }
    // verify token
    let verifiedUser = null;
    verifiedUser = (0, jwt_1.verifyToken)(token);
    req.user = verifiedUser; // add user to req object
    console.log(req.user, 'req.user');
    // use role as authguard
    next();
};
exports.default = isAuthenticated;

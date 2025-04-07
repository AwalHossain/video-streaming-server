"use strict";
// disable eslint for this file
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiError_1 = __importDefault(require("../../errors/apiError"));
const logger_1 = require("../../shared/logger");
const jwt_1 = require("../../utils/jwt");
const isAuthenticated = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            logger_1.errorLogger.error('Unauthorized' + ' ' + 'No Authorization header');
            throw new apiError_1.default(401, 'Unauthorized');
        }
        const token = authHeader.split(' ')[1];
        console.log('authHeader', token);
        if (!token) {
            logger_1.errorLogger.error('Unauthorized' + ' ' + 'Token not found');
            throw new apiError_1.default(401, 'Unauthorized');
        }
        // verify token
        let verifiedUser = null;
        verifiedUser = (0, jwt_1.verifyToken)(token);
        console.log('verifiedUser', verifiedUser);
        req.user = verifiedUser; // add user to req object
        console.log('req.user', req.user);
        // use role as authguard
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.default = isAuthenticated;
//# sourceMappingURL=isAuthenticated.js.map
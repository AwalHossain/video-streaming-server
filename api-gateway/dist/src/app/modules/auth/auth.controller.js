"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const response_1 = __importDefault(require("../../../shared/response"));
const auth_service_1 = require("./auth.service");
const registrationUser = async (req, res, next) => {
    try {
        console.log('registrationUser', req.body);
        const response = await auth_service_1.AuthService.registrationUser(req);
        (0, response_1.default)(res, response);
    }
    catch (error) {
        next(error);
    }
};
const loginUer = async (req, res, next) => {
    try {
        console.log('got req.body', req.body);
        const response = await auth_service_1.AuthService.loginUser(req);
        console.log('loginUser', response);
        (0, response_1.default)(res, response);
    }
    catch (error) {
        next(error);
    }
};
const checkSession = async (req, res, next) => {
    try {
        const response = await auth_service_1.AuthService.checkSession(req);
        (0, response_1.default)(res, response);
    }
    catch (error) {
        next(error);
    }
};
exports.AuthController = {
    registrationUser,
    loginUer,
    checkSession,
};
//# sourceMappingURL=auth.controller.js.map
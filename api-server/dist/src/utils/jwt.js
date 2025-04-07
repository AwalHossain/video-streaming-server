"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createToken = void 0;
const config_1 = __importDefault(require("../config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createToken = (id) => {
    const token = jsonwebtoken_1.default.sign({ id }, config_1.default.jwtSecret, {
        expiresIn: "7d",
    });
    return token;
};
exports.createToken = createToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
};
exports.verifyToken = verifyToken;

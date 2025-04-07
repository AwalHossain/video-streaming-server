"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const apiError_1 = __importDefault(require("../../../error/apiError"));
const user_model_1 = require("./user.model");
const register = async (data) => {
    const result = await user_model_1.User.findOne({ email: data.email });
    console.log("result", result);
    if (result) {
        throw new apiError_1.default(http_status_1.default.BAD_REQUEST, "Email already exists");
    }
    const newUser = await user_model_1.User.create(data);
    if (!newUser) {
        throw new apiError_1.default(http_status_1.default.BAD_REQUEST, "Failed to create user");
    }
    return newUser;
};
const login = async (data) => {
    console.log("data from api-server service", data);
    const result = await user_model_1.User.findOne({ email: data.email });
    if (!result) {
        throw new apiError_1.default(http_status_1.default.BAD_REQUEST, "User not found");
    }
    const isPasswordMatch = data.password === result.password;
    if (!isPasswordMatch) {
        throw new apiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid password");
    }
    return result;
};
const getUserById = async (id) => {
    const userData = user_model_1.User.findById(id).select("-password");
    if (!userData) {
        throw new apiError_1.default(http_status_1.default.BAD_REQUEST, "User not found");
    }
    return userData;
};
const updateUserById = async (id, data) => {
    const user = user_model_1.User.findByIdAndUpdate(id, data);
    if (!user) {
        throw new apiError_1.default(http_status_1.default.BAD_REQUEST, "User not found");
    }
};
exports.UserService = {
    register,
    login,
    getUserById,
    updateUserById,
};

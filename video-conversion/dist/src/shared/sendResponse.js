"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, data) => {
    const responseData = {
        statusCode: data.statusCode,
        success: data.success,
        message: data.message,
        data: data.data || null || undefined,
        meta: data.meta || null || undefined,
    };
    res.status(data.statusCode).json(responseData);
};
exports.sendResponse = sendResponse;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, data) => {
    const response = {
        success: data.success,
        statusCode: data.statusCode,
        message: data.message || 'Success',
        meta: data.meta,
        data: data.data || null,
    };
    res.status(data.statusCode).json(response);
};
exports.default = sendResponse;
//# sourceMappingURL=response.js.map
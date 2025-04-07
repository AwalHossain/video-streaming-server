"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const axios_1 = require("../../../shared/axios");
const registrationUser = async (req) => {
    console.log('got making api-server call', req.body);
    const response = await axios_1.apiService.post('/auth/register', req.body, {
        headers: {
            Authorization: req.headers.authorization,
        },
    });
    console.log('User registered successfully', { response });
    return response;
};
const loginUser = async (req) => {
    const response = await axios_1.apiService.post('/auth/login', req.body, {
        headers: {
            Authorization: req.headers.authorization,
        },
    });
    return response;
};
const checkSession = async (req) => {
    const response = await axios_1.apiService.get('/auth/check-session', {
        headers: {
            Authorization: req.headers.authorization,
        },
    });
    return response;
};
exports.AuthService = {
    registrationUser,
    loginUser,
    checkSession,
};
//# sourceMappingURL=auth.service.js.map
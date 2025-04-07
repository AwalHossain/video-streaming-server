"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoService = exports.apiService = exports.HttpService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const HttpService = (baseUrl) => {
    const instance = axios_1.default.create({
        baseURL: baseUrl,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    });
    instance.interceptors.request.use((config) => {
        return config;
    }, (error) => {
        return error;
    });
    instance.interceptors.response.use((response) => {
        response.data.statusCode = response.status;
        return response.data;
    }, (error) => {
        return Promise.reject(error);
    });
    return instance;
};
exports.HttpService = HttpService;
const apiService = HttpService(config_1.default.services.api);
exports.apiService = apiService;
const videoService = HttpService(config_1.default.services.video);
exports.videoService = videoService;
//# sourceMappingURL=axios.js.map
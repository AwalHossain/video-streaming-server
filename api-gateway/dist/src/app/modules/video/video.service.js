"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoService = void 0;
const apiError_1 = __importDefault(require("../../../errors/apiError"));
const axios_1 = require("../../../shared/axios");
const getAllVideos = async (req) => {
    const result = await axios_1.apiService.get('/videos', {
        params: req.query,
        headers: {
            Authorization: req.headers.authorization,
        },
    });
    console.log('result', result);
    if (result.statusCode !== 200)
        throw new apiError_1.default(500, 'Failed to fetch videos');
    return result;
};
const getMyVideos = async (req) => {
    const result = await axios_1.apiService.get('videos/myvideos', {
        params: req.query,
        headers: {
            Authorization: req.headers.authorization,
        },
    });
    console.log('result', result);
    if (result.statusCode !== 200)
        throw new apiError_1.default(500, 'Failed to fetch videos');
    return result;
};
const updateVideo = async (req) => {
    const result = await axios_1.apiService.put(`videos/update/${req.params.id}`, req.body, {
        headers: {
            Authorization: req.headers.authorization,
        },
    });
    console.log('result', result);
    if (result.statusCode !== 200)
        throw new apiError_1.default(500, 'Failed to update video');
    return result;
};
const getVideoById = async (req) => {
    const result = await axios_1.apiService.get(`videos/${req.params.id}`, {
        headers: {
            Authorization: req.headers.authorization,
        },
    });
    console.log('result', result);
    if (result.statusCode !== 200)
        throw new apiError_1.default(500, 'Failed to fetch video');
    return result;
};
exports.VideoService = {
    getAllVideos,
    getMyVideos,
    updateVideo,
    getVideoById,
};
//# sourceMappingURL=video.service.js.map
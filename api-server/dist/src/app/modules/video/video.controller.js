"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoController = void 0;
const mongodb_1 = require("mongodb");
const pagination_1 = require("../../../constants/pagination");
const catchAsyncError_1 = __importDefault(require("../../../shared/catchAsyncError"));
const pick_1 = __importDefault(require("../../../shared/pick"));
const video_constant_1 = require("./video.constant");
const video_service_1 = require("./video.service");
const insertVideo = (0, catchAsyncError_1.default)(async (req, res) => {
    const result = await video_service_1.VideoService.insertIntoDBFromEvent(req.body);
    res.status(200).json({
        status: "success",
        statusCode: 200,
        message: "Video inserted",
        data: result,
    });
});
const getAllVideos = (0, catchAsyncError_1.default)(async (req, res) => {
    const filters = (0, pick_1.default)(req.query, video_constant_1.videoFilterableFields);
    const paginationOptions = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = await video_service_1.VideoService.getAllVideos(filters, paginationOptions);
    res.status(200).json({
        status: "success",
        statusCode: 200,
        message: "Videos fetched",
        data: result.data,
        meta: result.meta,
    });
});
const getMyVideos = (0, catchAsyncError_1.default)(async (req, res) => {
    const filters = (0, pick_1.default)(req.query, video_constant_1.videoFilterableFields);
    const paginationOptions = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    console.log("userId", req.user);
    const userId = req.user.id;
    const result = await video_service_1.VideoService.getMyVideos(userId, filters, paginationOptions);
    res.status(200).json({
        status: "success",
        statusCode: 200,
        message: "Videos fetched",
        data: result.data,
        meta: result.meta,
    });
});
const updateVideo = (0, catchAsyncError_1.default)(async (req, res) => {
    console.log("req.params.id", req.body, req.params.id);
    const id = new mongodb_1.ObjectId(req.params.id);
    const result = await video_service_1.VideoService.update(id, req.body);
    res.status(200).json({
        status: "success",
        statusCode: 200,
        message: "Video updated",
        data: result,
    });
});
const updateHistory = (0, catchAsyncError_1.default)(async (req, res) => {
    const id = req.params.id;
    const result = await video_service_1.VideoService.updateHistory(id, req.body);
    res.send(result);
});
const getById = (0, catchAsyncError_1.default)(async (req, res) => {
    const id = new mongodb_1.ObjectId(req.params.id);
    const result = await video_service_1.VideoService.getById(req.params.id);
    // increment view count
    await video_service_1.VideoService.incrementViewCount(id);
    res.status(200).json({
        status: "success",
        statusCode: 200,
        message: "Video fetched",
        data: result,
    });
});
exports.VideoController = {
    updateVideo,
    updateHistory,
    getById,
    getAllVideos,
    getMyVideos,
    insertVideo,
};

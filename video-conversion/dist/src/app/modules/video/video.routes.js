"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoRoutes = void 0;
const express_1 = require("express");
const video_controller_1 = require("./video.controller");
const uploadMiddleware_1 = require("../../middleware/uploadMiddleware");
const isAuthenticated_1 = __importDefault(require("../../middleware/isAuthenticated"));
const router = (0, express_1.Router)();
router.post('/upload', isAuthenticated_1.default, uploadMiddleware_1.uploadMiddleware.fields([
    { name: 'video', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), video_controller_1.videoController.uploadVideo);
exports.videoRoutes = router;

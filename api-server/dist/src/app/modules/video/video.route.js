"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoRoutes = void 0;
const express_1 = require("express");
const isAuthenticated_1 = __importDefault(require("../../middleware/isAuthenticated"));
const video_controller_1 = require("./video.controller");
const router = (0, express_1.Router)();
router.post("/insert", isAuthenticated_1.default, video_controller_1.VideoController.insertVideo);
router.get("/", video_controller_1.VideoController.getAllVideos);
// get user videos
router.get("/myvideos", isAuthenticated_1.default, video_controller_1.VideoController.getMyVideos);
router.put("/update/:id", isAuthenticated_1.default, video_controller_1.VideoController.updateVideo);
router.patch("/updateHistory/:id", video_controller_1.VideoController.updateHistory);
// router.get("/:id", VideoController.getById);
exports.VideoRoutes = router;

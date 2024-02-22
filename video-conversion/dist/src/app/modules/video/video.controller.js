"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoController = void 0;
/* eslint-disable prefer-const */
const queueEvents_1 = require("../../../constant/queueEvents");
const catchAsyncError_1 = __importDefault(require("../../../errors/catchAsyncError"));
const videoProcessingHandler_1 = require("../../../handler/videoProcessingHandler");
const server_1 = require("../../../server");
const addJobToQueue_1 = require("../../../queues/addJobToQueue");
const uploadVideo = (0, catchAsyncError_1.default)(async (req, res) => {
    var _a;
    const userId = req.user.id;
    {
        if (!req.files['video']) {
            server_1.io.to(userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_VIDEO_UPLOADED, {
                status: 'failed',
                message: 'Video upload is failed',
            });
            res
                .status(400)
                .json({ status: 'failed', message: 'Video file is required' });
            return;
        }
        const videoMetadata = req.body.videoMetadata;
        server_1.io.to(userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_VIDEO_UPLOADED, {
            status: 'success',
            message: 'Video upload is success',
        });
        const video = req.files['video'][0];
        let image = null;
        if (req.files['image']) {
            image = req.files['image'][0];
        }
        const { videoDuration } = await (0, videoProcessingHandler_1.getVideoDurationAndResolution)(video.path);
        let payload = {
            fileName: video.filename,
            videoPath: video.path,
            watermarkPath: (_a = image === null || image === void 0 ? void 0 : image.path) !== null && _a !== void 0 ? _a : null,
            title: videoMetadata.originalName,
            duration: videoDuration,
        };
        // const result = await VideoService.updateHistory(videoMetadata._id, {
        //   history: { status: QUEUE_EVENTS.VIDEO_UPLOADED, createdAt: Date.now() },
        //   ...payload,
        // },);
        // if (result) {
        //   io.to(userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_METADATA_SAVED, {
        //     status: "success",
        //     name: "Video metadata saving",
        //     message: "Video metadata saved"
        //   });
        // } else {
        //   io.to(userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_METADATA_SAVED, {
        //     status: "failed",
        //     name: "Video metadata saving",
        //     message: "Failed to save video metadata"
        //   });
        // }
        await (0, addJobToQueue_1.addQueueItem)(queueEvents_1.QUEUE_EVENTS.VIDEO_UPLOADED, {
            userId,
            id: 'result._id',
            ...payload,
            ...video,
        });
        res.status(200).json({
            status: 'success',
            message: 'Upload success',
            data: {
                ...payload,
                ...req.file,
            },
        });
    }
});
exports.videoController = {
    uploadVideo,
};

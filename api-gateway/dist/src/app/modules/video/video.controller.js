"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoController = void 0;
const uuid_1 = require("uuid");
const event_1 = require("../../../constants/event");
const notify_1 = require("../../../constants/notify");
const catchAsyncError_1 = __importDefault(require("../../../shared/catchAsyncError"));
const rabbitMQ_1 = __importDefault(require("../../../shared/rabbitMQ"));
const response_1 = __importDefault(require("../../../shared/response"));
const doSpacesUpload_1 = __importDefault(require("../../../utils/doSpacesUpload"));
const video_event_1 = __importDefault(require("./video.event"));
const video_service_1 = require("./video.service");
// get presigned URL for direct upload to digital ocean spaces
const getPresignedUrl = (0, catchAsyncError_1.default)(async (req, res) => {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
        return res.status(400).json({
            status: 'fail',
            message: 'Filename and contentType are required',
        });
    }
    const userId = req.user.id;
    // Generate clean filename
    const cleanFilename = filename
        .split('.')[0]
        .replace(/\s+/g, '-')
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '') + '-' + (0, uuid_1.v4)() + '.' + filename.split('.').pop();
    const result = await doSpacesUpload_1.default.generatePresignedUrl({
        filename: cleanFilename,
        contentType: contentType,
        userId: userId,
        expirySeconds: 3600,
    });
    (0, response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Presigned URL generated successfully',
        data: result,
    });
});
// Define confirm upload function after getPresignedUrl
const confirmUpload = (0, catchAsyncError_1.default)(async (req, res) => {
    const { fileKey, originalName, fileName, bucketName } = req.body;
    if (!fileKey || !fileName) {
        return res.status(400).json({
            status: 'fail',
            message: 'File information is required',
        });
    }
    const userId = req.user.id;
    // console.log("userId", userId);
    // Notify that video is being processed
    rabbitMQ_1.default.sendToQueue(notify_1.NOTIFY_EVENTS.NOTIFT_VIDEO_UPLOADING_BUCKET, {
        userId,
        status: 'completed',
        name: 'Video Upload Complete',
        fileName: originalName,
        message: 'Video has been uploaded successfully and is being processed',
    });
    const payload = {
        originalName,
        recordingDate: Date.now(),
        duration: '0:00',
        visibility: 'Public',
        author: userId,
        fileName,
        title: originalName.split('.')[0].replace(/[_]/g, ''),
    };
    // Broadcast event to api-server to insert video metadata
    (0, video_event_1.default)(event_1.API_SERVER_EVENTS.INSERT_VIDEO_METADATA_EVENT, payload);
    // Send video-conversion server necessary data
    const data = {
        userId,
        fileName,
        bucketName,
        fileKey,
    };
    // Broadcast event to video-conversion server
    (0, video_event_1.default)(event_1.VIDEO_CONVERSION_SERVER.SEND_VIDEO_METADATA_EVENT, data);
    (0, response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Video processing started',
        data: {
            payload,
            processingInfo: data,
        },
    });
});
// const uploadToBucket = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     RabbitMQ.sendToQueue(NOTIFY_EVENTS.NOTIFT_VIDEO_UPLOADING_BUCKET, {
//       userId: req.user.id,
//       status: 'processing',
//       name: 'Video Uploading to bucket',
//       fileName: req?.file?.originalname,
//       message: 'Video is uploading to bucket',
//     });
//     // Check if file is present
//     const file = req?.file;
//     // Rename file to remove spaces and add timestamp
//     file.filename =
//       file.originalname
//         .split('.')[0]
//         .replace(/\s+/g, '-')
//         .replace(/\(.*?\)/g, '')
//         .replace(/\[.*?\]/g, '') + uuidv4();
//     const userId = req.user.id;
//     if (!file) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'No file uploaded',
//       });
//     }
//     // azure container name
//     const containerName = `upload-container-${uuidv4()}`;
//     // call azureUpload function to upload file to azure
//     const response = await azureUpload(file, containerName);
//     console.log('response', response);
//     const payload = {
//       originalName: file.originalname,
//       recordingDate: Date.now(),
//       duration: '0:00',
//       visibility: 'Public',
//       author: userId,
//       fileName: file.filename,
//       title: file.originalname.split('.')[0].replace(/[_]/g, ''),
//     };
//     // broadcast event to api-server to insert video metadata
//     broadcastVideoEvent(API_SERVER_EVENTS.INSERT_VIDEO_METADATA_EVENT, payload);
//     //   send video-conversion server necessary data
//     const data = {
//       userId,
//       fileName: file.filename,
//       containerName: containerName,
//     };
//     // broadcase event to video-conversion server
//     broadcastVideoEvent(
//       VIDEO_CONVERSION_SERVER.SEND_VIDEO_METADATA_EVENT,
//       data,
//     );
//     res.status(200).json({
//       status: 'success',
//       message: 'File uploaded successfully',
//       payload,
//       data,
//     });
//     RabbitMQ.sendToQueue(NOTIFY_EVENTS.NOTIFT_VIDEO_UPLOADING_BUCKET, {
//       userId: req.user.id,
//       status: 'completed',
//       name: 'Video Uploading to bucket',
//       fileName: req?.file?.originalname,
//       message: 'Video is uploaded to bucket',
//     });
//   } catch (err) {
//     next(err);
//   }
// };
const getAllVideos = async (req, res, next) => {
    try {
        const result = await video_service_1.VideoService.getAllVideos(req);
        (0, response_1.default)(res, result);
    }
    catch (err) {
        next(err);
    }
};
const getMyVideos = async (req, res, next) => {
    try {
        const result = await video_service_1.VideoService.getMyVideos(req);
        (0, response_1.default)(res, result);
    }
    catch (err) {
        next(err);
    }
};
const updateVideo = async (req, res, next) => {
    try {
        const result = await video_service_1.VideoService.updateVideo(req);
        (0, response_1.default)(res, result);
    }
    catch (err) {
        next(err);
    }
};
const getVideoById = async (req, res, next) => {
    try {
        const result = await video_service_1.VideoService.getVideoById(req);
        (0, response_1.default)(res, result);
    }
    catch (err) {
        next(err);
    }
};
exports.VideoController = {
    getAllVideos,
    getMyVideos,
    updateVideo,
    getVideoById,
    getPresignedUrl,
    confirmUpload,
};
//# sourceMappingURL=video.controller.js.map
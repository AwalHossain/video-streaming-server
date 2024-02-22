"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const server_1 = require("../../server");
const queueEvents_1 = require("../../constant/queueEvents");
let globalName = "";
const storageEngine = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let uploadFolder = "";
        globalName = file.originalname.split(".")[0].replace(/\s+/g, '_') + "_" + Date.now();
        if (!uploadFolder) {
            uploadFolder = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "_" + Date.now();
        }
        const uploadPath = `uploads/${uploadFolder}/videos`;
        fs_1.default.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const isImage = file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg';
        if (isImage) {
            cb(null, globalName + ".png");
        }
        else {
            cb(null, globalName);
        }
    },
});
const fileFilter = async (req, file, cb) => {
    const userId = (req.user).id;
    console.log(userId, 'checking user id');
    if (file.mimetype === "video/mp4" || file.mimetype === "video/x-matroska" || file.mimetype === "video/avi" || file.mimetype === "video/webm") {
        const payload = {
            originalName: path_1.default.basename(file.originalname, path_1.default.extname(file.originalname)),
            recordingDate: Date.now(),
            duration: "0:00",
            visibility: "Public",
            author: userId,
            title: file.originalname.split(".")[0].replace(/[_]/g, ' ')
        };
        // const videoMetadata = await VideoService.insert(payload);
        // console.log("videoMetadata", videoMetadata, "userid", userId);
        server_1.io.to(userId).emit("message", "This is such a bullishit, cause i am sendign the meesage to different user!");
        server_1.io.to(userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_VIDEO_INITIAL_DB_INFO, {
            name: "notify_video_metadata_saved",
            status: "success",
            message: "Video metadata saved",
            // data: videoMetadata
        });
        req.body.videoMetadata = payload; // videoMetadata;
        cb(null, true);
    }
    else if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    }
};
exports.uploadMiddleware = (0, multer_1.default)({
    storage: storageEngine,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 50,
    },
});

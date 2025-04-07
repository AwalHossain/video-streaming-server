"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Video = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const video_constant_1 = require("./video.constant");
const VideoSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        // required: true,
    },
    description: {
        type: String,
        default: "",
    },
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    duration: {
        type: String,
    },
    viewsCount: {
        type: Number,
        min: 0,
        default: 0,
    },
    playlistId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Playlist",
    },
    language: {
        type: String,
        default: "English",
    },
    recordingDate: {
        type: Date,
        required: true,
    },
    category: {
        type: String,
        default: "Entertainment",
    },
    likesCount: {
        type: Number,
        min: 0,
        default: 0,
    },
    dislikesCount: {
        type: Number,
        min: 0,
        default: 0,
    },
    videoLink: {
        type: String,
    },
    rawVideoLink: {
        type: String,
    },
    videoPath: {
        type: String,
    },
    fileName: {
        type: String,
    },
    originalName: {
        type: String,
        required: true,
    },
    watermarkPath: {
        type: String,
    },
    thumbnailUrl: {
        type: String,
    },
    history: {
        type: Array,
        default: [],
    },
    status: {
        type: String,
        enum: Object.values(video_constant_1.VIDEO_STATUS),
        default: video_constant_1.VIDEO_STATUS.PENDING,
    },
    visibility: {
        type: String,
        enum: Object.values(video_constant_1.VIDEO_VISIBILITIES),
        default: video_constant_1.VIDEO_VISIBILITIES.PUBLIC,
    },
    tags: {
        type: [String],
        default: [],
    },
    size: {
        type: Number,
    },
    videoConversionTime: {
        type: String,
    },
}, {
    timestamps: true,
});
exports.Video = (0, mongoose_1.model)("Video", VideoSchema);
//install mongose types
//npm i -D @types/mongoose

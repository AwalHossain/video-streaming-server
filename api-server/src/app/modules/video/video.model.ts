import mongoose, { model } from "mongoose";
import { VIDEO_STATUS, VIDEO_VISIBILITIES } from "./video.constant";

const VideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      // required: true,
    },
    description: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
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
      enum: Object.values(VIDEO_STATUS),
      default: VIDEO_STATUS.PENDING,
    },
    visibility: {
      type: String,
      enum: Object.values(VIDEO_VISIBILITIES),
      default: VIDEO_VISIBILITIES.PUBLIC,
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
  },
  {
    timestamps: true,
  }
);

export const Video = model("Video", VideoSchema);

//install mongose types
//npm i -D @types/mongoose

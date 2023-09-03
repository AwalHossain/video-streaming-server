import mongoose, { model } from "mongoose";

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  viewsCount: {
    type: Number,
    min: 0,
    default: 0,
  },
  visibility: {
    type: String,
    enum: ["public", "private", "unlisted"],
    required: true,
  },
  playlistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Playlist",
  },
  language: {
    type: String,
  },
  recordingDate: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
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
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
  },
});

export const Video = model("Video", VideoSchema);


//install mongose types
//npm i -D @types/mongoose
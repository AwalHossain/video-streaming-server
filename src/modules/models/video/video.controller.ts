/**
 * make it typescript friendly
 */

import { Request, Response } from "express";
// import { deleteById, getById, insert, search, update } from "./service";

import { ObjectId } from "mongodb";
import { NOTIFY_EVENTS, QUEUE_EVENTS } from "../../queues/constants";
import { addQueueItem } from "../../queues/queue";
import EventEmitter from './../../../event-manager';
import { VideoService } from "./video.service";


const uploadVideo = async (req: Request, res: Response) => {
  try {
    if (!(req.files['video'])) {
      EventEmitter.emit(NOTIFY_EVENTS.NOTIFY_VIDEO_UPLOADED, { status: "failed", message: "Video upload is failed" });
      res.status(400).json({ status: "failed", message: "Video file is required" });
      return;
    } else {
      EventEmitter.emit(NOTIFY_EVENTS.NOTIFY_VIDEO_UPLOADED, { status: "success", message: "Video upload is success" });
    }


    const video = req.files['video'][0];

    let image = null;
    if (req.files['image']) {
      image = req.files['image'][0];
    }
    console.log("user given metadata", "title");

    let payload = {
      ...req.body,
      originalName: video.originalname,
      fileName: video.filename,
      recordingDate: Date.now(),
      videoLink: video.path,
      viewCount: 0,
      duration: 0,
      visibility: "Public",
      watermarkPath: image?.path ?? null,
    }

    const result = await VideoService.insert(payload);

    if (!result) {
      EventEmitter.emit(NOTIFY_EVENTS.NOTIFY_VIDEO_METADATA_SAVED, { status: "failed", message: "Failed to save video metadata" });
      throw new Error("Video save to db failed");
    } else {
      EventEmitter.emit(NOTIFY_EVENTS.NOTIFY_VIDEO_METADATA_SAVED, { status: "success", message: "Video metadata saved" });
    }

    console.log("result", result);

    await addQueueItem(QUEUE_EVENTS.VIDEO_UPLOADED, {
      id: result._id,
      ...payload,
      ...video,
    });
    res
      .status(200)
      .json({
        status: "success", message: "Upload success",
        data: {
          // result,
          ...req.file,
        }
      });
    return;
  } catch (error) {
    console.error(error);
    res.send(error);
  }
}


const updateHistory = async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id);
  const result = await VideoService.updateHistory(id, req.body);

  res.send(result);
}








export const VideoController = {
  uploadVideo,
  updateHistory,
}
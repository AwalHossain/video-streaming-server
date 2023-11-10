/**
 * make it typescript friendly
 */

import { Request, Response } from "express";
// import { deleteById, getById, insert, search, update } from "./service";

import { ObjectId } from "mongodb";

import { io } from "../../../server";
import catchAsync from "../../../shared/catchAsyncError";
import { NOTIFY_EVENTS, QUEUE_EVENTS } from "../../queues/constants";
import { addQueueItem } from "../../queues/queue";
import { VideoService } from "./video.service";


const uploadVideo = catchAsync(async (req: Request, res: Response) => {
  {

    if (!(req.files['video'])) {
      io.emit(NOTIFY_EVENTS.NOTIFY_VIDEO_UPLOADED, { status: "failed", message: "Video upload is failed" });
      res.status(400).json({ status: "failed", message: "Video file is required" });
      return;
    }

    const videoMetadata = req.body.videoMetadata;

    io.emit(NOTIFY_EVENTS.NOTIFY_VIDEO_UPLOADED, { status: "success", message: "Video upload is success" });



    const video = req.files['video'][0];

    let image = null;
    if (req.files['image']) {
      image = req.files['image'][0];
    }

    let payload = {
      fileName: video.filename,
      videoLink: video.path,
      watermarkPath: image?.path ?? null,
    }

    const result = await VideoService.update(videoMetadata._id, {
      history: { status: QUEUE_EVENTS.VIDEO_UPLOADED, createdAt: Date.now() },
      payload
    });

    console.log("user updated metadata", result);

    if (result) {
      io.emit(NOTIFY_EVENTS.NOTIFY_VIDEO_METADATA_SAVED, {
        status: "success",
        name: "Video metadata saving",
        message: "Video metadata saved"
      });
    } else {
      io.emit(NOTIFY_EVENTS.NOTIFY_VIDEO_METADATA_SAVED, {
        status: "failed",
        name: "Video metadata saving",
        message: "Failed to save video metadata"
      });
    }

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
          ...result,
          ...req.file,
        }
      });
    return;

  }
});


const updateVideo = catchAsync(async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id);
  const result = await VideoService.update(id, req.body);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Video updated",
    data: result,
  })

})


const updateHistory = catchAsync(async (req: Request, res: Response) => {
  async (req: Request, res: Response) => {
    const id = new ObjectId(req.params.id);
    const result = await VideoService.updateHistory(id, req.body);

    res.send(result);
  }
})








export const VideoController = {
  uploadVideo,
  updateVideo,
  updateHistory,
}
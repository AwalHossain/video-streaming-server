/**
 * make it typescript friendly
 */

import { Request, Response } from "express";
// import { deleteById, getById, insert, search, update } from "./service";

import { S3Client } from "@aws-sdk/client-s3";
import { Types } from "mongoose";
import { QUEUE_EVENTS } from "../../queues/constants";
import { addQueueItem } from "../../queues/queue";
import { VideoService } from "./video.service";

// Set S3 endpoint to DigitalOcean Spaces
// Set S3 endpoint to DigitalOcean Spaces

const s3 = new S3Client({
  forcePathStyle: true,
  endpoint: process.env.ENDPOINT,  
  region: "sgp1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
  },
}) as any;

const BASE_URL = `/api/v1/videos2`;

// const setupRoutes = (app: Express): void => {
  console.log(`Setting up routes for videos`);



 


  const uploadVideo = async (req: Request, res: Response) => {
    try {
      console.log("POST upload", JSON.stringify(req.body));
      // const payload: any = { ...req.body };
      console.log("user given metadata",req.file, "title");

      let payload = {
        ...req.body,
        originalName: req.file.originalname,
        fileName: req.file.filename,
        recordingDate: Date.now(),
        videoLink: req.file.path,
        viewCount: 0,
        duration: 0,
        visibility: "Public",

      }
      console.log(payload, "payload");
      

   const result = await VideoService.insert(payload);

      console.log("result", result);
      
      await addQueueItem(QUEUE_EVENTS.VIDEO_UPLOADED, {
        id : result._id,
        ...payload,
        ...req.file,
      });
      res
        .status(200)
        .json({ status: "success", message: "Upload success",data:{
          'vidoe info added to db': result,
          ...req.file,
        } });
      return;
    } catch (error) {
      console.error(error);
      res.send(error);
    }
  }


  const updateHistory = async (req: Request, res: Response) => {
    const id = new Types.ObjectId(req.params.id);
    const result = await VideoService.updateHistory(id , req.body);

    res.send(result);
  }








export const VideoController = {
  uploadVideo,
  updateHistory,
}
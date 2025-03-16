import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/catchAsyncError";
import pick from "../../../shared/pick";
import { videoFilterableFields } from "./video.constant";
import { VideoService } from "./video.service";

const insertVideo = catchAsync(async (req: Request, res: Response) => {
  const result = await VideoService.insertIntoDBFromEvent(req.body);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Video inserted",
    data: result,
  });
});

const getAllVideos = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, videoFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await VideoService.getAllVideos(filters, paginationOptions);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Videos fetched",
    data: result.data,
    meta: result.meta,
  });
});

const getMyVideos = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, videoFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);
  console.log("userId", req.user);
  const userId = (req.user as any).id;
  const result = await VideoService.getMyVideos(
    userId,
    filters,
    paginationOptions
  );

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Videos fetched",
    data: result.data,
    meta: result.meta,
  });
});

const updateVideo = catchAsync(async (req: Request, res: Response) => {
  console.log("req.params.id", req.body, req.params.id);

  const id = new ObjectId(req.params.id);
  const result = await VideoService.update(id, req.body);

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Video updated",
    data: result,
  });
});

const updateHistory = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await VideoService.updateHistory(id, req.body);

  res.send(result);
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id);

  const result = await VideoService.getById(req.params.id);

  // increment view count
  await VideoService.incrementViewCount(id);

  
  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Video fetched",
    data: result,
  });
});

export const VideoController = {
  updateVideo,
  updateHistory,
  getById,
  getAllVideos,
  getMyVideos,
  insertVideo,
};

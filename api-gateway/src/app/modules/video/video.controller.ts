import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  API_SERVER_EVENTS,
  VIDEO_CONVERSION_SERVER,
} from '../../../constants/event';
import { NOTIFY_EVENTS } from '../../../constants/notify';
import catchAsync from '../../../shared/catchAsyncError';
import RabbitMQ from '../../../shared/rabbitMQ';
import sendResponse from '../../../shared/response';
import doSpacesUpload from '../../../utils/doSpacesUpload';
import broadcastVideoEvent from './video.event';
import { VideoService } from './video.service';

// get presigned URL for direct upload to digital ocean spaces
const getPresignedUrl = catchAsync(async (req: Request, res: Response) => {

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
    .replace(/\[.*?\]/g, '') + '-' + uuidv4() + '.' + filename.split('.').pop();
  
    const result = await doSpacesUpload.generatePresignedUrl({
        filename: cleanFilename,
        contentType: contentType,
        userId: userId,
        expirySeconds: 3600,
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Presigned URL generated successfully',
        data: result,
    });

})

// Define confirm upload function after getPresignedUrl
const confirmUpload = catchAsync(async (req: Request, res: Response) => {
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
  RabbitMQ.sendToQueue(NOTIFY_EVENTS.NOTIFT_VIDEO_UPLOADING_BUCKET, {
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
  broadcastVideoEvent(API_SERVER_EVENTS.INSERT_VIDEO_METADATA_EVENT, payload);

  // Send video-conversion server necessary data
  const data = {
    userId,
    fileName,
    bucketName,
    fileKey,
  };

  // Broadcast event to video-conversion server
  broadcastVideoEvent(
    VIDEO_CONVERSION_SERVER.SEND_VIDEO_METADATA_EVENT,
    data,
  );

  sendResponse(res, {
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

const getAllVideos = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await VideoService.getAllVideos(req);

    sendResponse(res, result);
  } catch (err) {
    next(err);
  }
};

const getMyVideos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await VideoService.getMyVideos(req);

    sendResponse(res, result);
  } catch (err) {
    next(err);
  }
};

const updateVideo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await VideoService.updateVideo(req);

    sendResponse(res, result);
  } catch (err) {
    next(err);
  }
};

const getVideoById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await VideoService.getVideoById(req);

    sendResponse(res, result);
  } catch (err) {
    next(err);
  }
};

export const VideoController = {

  getAllVideos,
  getMyVideos,
  updateVideo,
  getVideoById,
  getPresignedUrl,
  confirmUpload,
};

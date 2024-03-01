import { Request, Response } from 'express';
import {
  API_SERVER_EVENTS,
  VIDEO_CONVERSION_SERVER,
} from '../../../constants/event';
import catchAsync from '../../../shared/catchAsyncError';
import azureUpload from '../../../utils/azureUpload';
import broadcastVideoEvent from './video.event';

const uploadToBucket = catchAsync(async (req: Request, res: Response) => {
  // Check if file is present
  const file = req?.file;
  // Rename file to remove spaces and add timestamp
  file.filename =
    file.originalname.split('.')[0].replace(/\s+/g, '-') + Date.now();

  const userId = req.user.id;
  if (!file) {
    return res.status(400).json({
      status: 'fail',
      message: 'No file uploaded',
    });
  }

  // azure container name
  const containerName = `container-${new Date().getTime()}`;
  // call azureUpload function to upload file to azure
  const response = await azureUpload(file, containerName);
  console.log('response', response);

  const payload = {
    originalName: file.originalname,
    recordingDate: Date.now(),
    duration: '0:00',
    visibility: 'Public',
    author: userId,
    fileName: file.filename,
    title: file.originalname.split('.')[0].replace(/[_]/g, ''),
  };

  // broadcast event to api-server to insert video metadata
  broadcastVideoEvent(API_SERVER_EVENTS.INSERT_VIDEO_METADATA_EVENT, payload);

  //   send video-conversion server necessary data
  const data = {
    userId,
    fileName: file.filename,
    containerName: containerName,
  };

  // broadcase event to video-conversion server
  broadcastVideoEvent(VIDEO_CONVERSION_SERVER.SEND_VIDEO_METADATA_EVENT, data);

  res.status(200).json({
    status: 'success',
    message: 'File uploaded successfully',
    response,
  });
});

export const VideoController = {
  uploadToBucket,
};

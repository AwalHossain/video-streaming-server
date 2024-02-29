import { BlobServiceClient } from '@azure/storage-blob';
import { Request, Response } from 'express';
import config from '../../../config';
import {
  API_SERVER_EVENTS,
  VIDEO_CONVERSION_SERVER,
} from '../../../constants/event';
import catchAsync from '../../../shared/catchAsyncError';
import RabbitMQ from '../../../shared/rabbitMQ';

const uploadToBucket = catchAsync(async (req: Request, res: Response) => {
  console.log('req.file', req.file);

  const file = req.file;
  if (!file) {
    return res.status(400).json({
      status: 'fail',
      message: 'No file uploaded',
    });
  }

  file.filename =
    file.originalname.split('.')[0].replace(/\s+/g, '-') + Date.now();

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    config.azure.storage_connection_string,
  );

  const containerName = `container-${new Date().getTime()}`;
  // Check if container exists

  const containerClient = blobServiceClient.getContainerClient(containerName);

  await containerClient.createIfNotExists({
    access: 'container',
  });

  // Create blob client for the specific file location
  const blockBlobClient = containerClient.getBlockBlobClient(file.filename);
  // Upload data to the blob

  // Read the file from disk
  const buffer = file.buffer;

  // Upload data to the blob
  const uploadBlobResponse = await blockBlobClient.upload(
    buffer,
    buffer.length,
  );

  console.log('uploadBlobResponse', uploadBlobResponse);

  const payload = {
    originalName: file.originalname,
    recordingDate: Date.now(),
    duration: '0:00',
    visibility: 'Public',
    author: '65b7879311d7094f2af84fcb',
    fileName: file.filename,
    title: file.originalname.split('.')[0].replace(/[_]/g, ''),
  };

  //   update video Metadata in the database
  RabbitMQ.sendToQueue(API_SERVER_EVENTS.INSERT_VIDEO_METADATA_EVENT, payload);

  //   send video-conversion server necessary data
  const data = {
    userId: '65b7879311d7094f2af84fcb',
    originalName: file.filename,
    containerName: containerName,
  };

  RabbitMQ.sendToQueue(VIDEO_CONVERSION_SERVER.SEND_VIDEO_METADATA_EVENT, data);

  res.status(200).json({
    status: 'success',
    message: 'File uploaded successfully',
    data: uploadBlobResponse,
  });
});

export const VideoController = {
  uploadToBucket,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import fsextra from 'fs-extra';
import path from 'path';
import { API_GATEWAY_EVENTS, API_SERVER_EVENTS } from '../constant/events';
import ApiError from '../errors/apiError';
import { errorLogger, logger } from '../shared/logger';
import RabbitMQ from '../shared/rabbitMQ';
import uploadProcessedFile from './uploadToCloud';

const processHLSFile = async (data: any, queueName: string) => {
  const dataCopy = JSON.parse(JSON.stringify(data));

  const hlsData = {
    id: dataCopy.id,
    history: { status: queueName, createdAt: Date.now() },
  };
  RabbitMQ.sendToQueue(API_SERVER_EVENTS.VIDEO_HLS_CONVERTED_EVENT, hlsData);

  const rootFolder = path.resolve('./');
  const file = dataCopy.destination.split('/')[1];
  const fileName = dataCopy.fileName;
  const fileExt = path.extname(fileName); // Gets extension with dot (.mp4, .mkv, etc.)
  const baseFileName = fileExt ? fileName.slice(0, -fileExt.length) : fileName;
  const bucketName = process.env.DO_SPACES_BUCKET_NAME;
  
  const videoId = dataCopy.id || `video-${Date.now()}`;
  const userFolder = dataCopy.userId 
    ? `uploads/${dataCopy.userId}/videos/${videoId}` 
    : `uploads/anonymous/videos/${videoId}`;
  

  const dataObj = {
    videoLink: `https://${bucketName}.${process.env.DO_SPACES_REGION || 'sgp1'}.cdn.digitaloceanspaces.com/${userFolder}/${baseFileName}_master.m3u8`,
    thumbnailUrl: `https://${bucketName}.${process.env.DO_SPACES_REGION || 'sgp1'}.cdn.digitaloceanspaces.com/${userFolder}/${baseFileName}.png`,
    rawVideoLink: `${userFolder}/${baseFileName}`,
  };
  
  console.log('dataObj', dataObj, `./uploads/${file}/hls`, `${file}`, dataCopy);

  const deletedFolder = path.join(rootFolder, `./uploads/${file}`);
  try {
    await uploadProcessedFile(
      rootFolder,
      `./uploads/${file}/hls`,
      dataCopy,
    ),
      await uploadProcessedFile(
        rootFolder,
        `./uploads/${file}/thumbnails`,
        dataCopy,
      );

    const awsData = {
      userId: dataCopy.userId,
      status: 'completed',
      name: 'AWS Bucket uploading',
      message: 'Video upload completed',
      fileName: dataCopy.fileName,
    };
    RabbitMQ.sendToQueue(
      API_GATEWAY_EVENTS.NOTIFY_AWS_S3_UPLOAD_PROGRESS,
      awsData,
    );

    const awsUploadCompleted = {
      userId: dataCopy.userId,
      status: 'success',
      name: 'Video published',
      message: 'Video published',
    };

    RabbitMQ.sendToQueue(
      API_GATEWAY_EVENTS.NOTIFY_VIDEO_PUBLISHED,
      awsUploadCompleted,
    );

    const publishData = {
      id: dataCopy.id,
      status: 'published',
      videoLink: dataObj.videoLink,
      thumbnailUrl: dataObj.thumbnailUrl,
      rawVideoLink: dataObj.rawVideoLink,
    };

    RabbitMQ.sendToQueue(API_SERVER_EVENTS.VIDEO_PUBLISHED_EVENT, publishData);
    // Delete the folder after uploading all files
    await fsextra.remove(deletedFolder);
    logger.info(`Deleted folder: ${deletedFolder}`);
  } catch (error) {
    errorLogger.error(error, 'error');
    throw new ApiError(500, 'Video uploading to Space failed');
  }
};

export default processHLSFile;

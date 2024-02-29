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

  console.log('dataCopy', dataCopy);
  console.log(
    'dataCopy having fight again data having flight',
    dataCopy,
    'data',
    data,
  );

  // await VideoService.updateHistory(data.id, {
  //   history: { status: queueName, createdAt: Date.now() },
  // });

  const hlsData = {
    id: dataCopy.id,
    history: { status: queueName, createdAt: Date.now() },
  };
  RabbitMQ.sendToQueue(API_SERVER_EVENTS.VIDEO_HLS_CONVERTED_EVENT, hlsData);

  const rootFolder = path.resolve('./');
  // destination: 'uploads/videoplayback_1693755779611
  const file = dataCopy.destination.split('/')[1];
  const fileName = dataCopy.fileName;
  const folderName = dataCopy.folder;
  const dataObj = {
    videoLink: `https://mernvideo.blob.core.windows.net/${folderName}/${fileName}_master.m3u8`,
    thumbnailUrl: `https://mernvideo.blob.core.windows.net/${folderName}/${fileName}.png`,
  };

  console.log('dataObj', dataObj, `./uploads/${file}/hls`, `${file}`);

  const deletedFolder = path.join(rootFolder, `./uploads/${file}`);
  //   const folderPath1 = path.join(rootFolder, `./uploads/${file}/hls`);
  //   const folderPath2 = path.join(rootFolder, `./uploads/${file}/thumbnails`);

  try {
    await uploadProcessedFile(
      rootFolder,
      `./uploads/${file}/hls`,
      `${file}`,
      dataCopy,
    ),
      await uploadProcessedFile(
        rootFolder,
        `./uploads/${file}/thumbnails`,
        `${file}`,
        dataCopy,
      );

    //   await VideoService.updateHistory(data.id, {
    //     history: { status: "Successfully uploaded to the S3 bucket.", createdAt: Date.now() },
    //   });

    // io.to(data.userId).emit(
    //   NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_PROGRESS,
    //   {
    //     status: 'completed',
    //     name: 'AWS Bucket uploading',
    //     message: 'Video upload completed',
    //     fileName: data.fileName,
    //   },
    // );
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

    // io.to(data.userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_PUBLISHED, {
    //   status: 'success',
    //   name: 'Video published',
    //   message: 'Video published',
    // });
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
    //   await VideoService.update(data.id, {
    //     status: VIDEO_STATUS.PUBLISHED,
    //     videoLink: `https://mern-video-bucket.sgp1.cdn.digitaloceanspaces.com/${file}/${data.fileName}_master.m3u8`,
    //     thumbnailUrl: `https://mern-video-bucket.sgp1.cdn.digitaloceanspaces.com/${file}/${data.fileName}.png`,
    //   })

    const publishData = {
      id: dataCopy.id,
      history: {
        status: 'published',
        videoLink: `https://mernvideo.blob.core.windows.net/${folderName}/${fileName}_master.m3u8`,
        thumbnailUrl: `https://mernvideo.blob.core.windows.net/${folderName}/${fileName}.png`,
      },
    };

    RabbitMQ.sendToQueue(API_SERVER_EVENTS.VIDEO_PUBLISHED_EVENT, publishData);
    // Delete the folder after uploading all files
    await fsextra.remove(deletedFolder);
    logger.info(`Deleted folder: ${deletedFolder}`);
  } catch (error) {
    errorLogger.error(error, 'error');
    // io.to(data.userId).emit(NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_FAILED, {
    //   status: 'failed',
    //   message: 'Video uploading failed',
    // });
    throw new ApiError(500, 'Video uploading to Space failed');
  }
};

export default processHLSFile;

/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncLock from 'async-lock';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { API_SERVER_EVENTS } from '../constant/events';
import { IVideoMetadata } from '../interface/common';
import EventEmitter from '../shared/event-manager';
import { logger } from '../shared/logger';
import RabbitMQ from '../shared/rabbitMQ';
import azureDownload from '../utils/azureDownload';
import initiateVideoProcessing from './initiateVideoProcessing';

const getVideoMetadata = async (): Promise<any> => {
  await RabbitMQ.consume(
    API_SERVER_EVENTS.GET_VIDEO_METADATA_EVENT,
    (msg, ack) => {
      const data = JSON.parse(msg.content.toString());
      console.log('vide doe metad', data);
      EventEmitter.emit('videoMetadata', data);
      ack();
    },
  );
};

const lock = new AsyncLock();
async function downloadBlob(
  containerName: string,
  blobName: string,
  userId: string,
) {
  // get video metadata from api-server
  await getVideoMetadata();

  let videoMetadata: IVideoMetadata;
  await new Promise((resolve) => {
    EventEmitter.once('videoMetadata', (data) => {
      videoMetadata = data;
      resolve(videoMetadata);
    });
  });

  let uploadFolder = '';
  if (!uploadFolder) {
    uploadFolder = `container-${uuidv4()}`;
  }

  // download blob from azure
  await lock.acquire('azureDownload', async () => {
    await azureDownload({ containerName, blobName, uploadFolder });
  });

  const destination = path
    .normalize(path.join('uploads', uploadFolder, 'videos'))
    .replace(/\\/g, '/');

  const videoPath = path
    .normalize(path.join('uploads', uploadFolder, 'videos', blobName))
    .replace(/\\/g, '/');

  logger.info('Destination path:' + JSON.stringify(destination));
  // intiate video conversion
  await initiateVideoProcessing({
    videoPath,
    destination,
    userId,
    videoMetadata,
  });
}

export default downloadBlob;

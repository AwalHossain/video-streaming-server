/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path';
import { API_SERVER_EVENTS } from '../constant/events';
import { IVideoMetadata } from '../interface/common';
import EventEmitter from '../shared/event-manager';
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

async function downloadBlob(
  containerName: string,
  blobName: string,
  userId: string,
) {
  // get video metadata from api-server
  await getVideoMetadata();

  let videoMetadata: IVideoMetadata;
  EventEmitter.on('videoMetadata', (data) => {
    videoMetadata = data;
  });

  let uploadFolder = '';
  if (!uploadFolder) {
    uploadFolder = `container-${new Date().getTime()}`;
  }

  // download blob from azure
  await azureDownload({ containerName, blobName, uploadFolder });

  const destination = path
    .normalize(path.join('uploads', uploadFolder, 'videos', blobName))
    .replace(/\\/g, '/');

  const videoPath = path.join('uploads', uploadFolder, 'videos', blobName);
  console.log('Destination path:', JSON.stringify(destination));
  // intiate video conversion
  await initiateVideoProcessing({
    videoPath,
    destination,
    userId,
    videoMetadata,
  });
}

export default downloadBlob;

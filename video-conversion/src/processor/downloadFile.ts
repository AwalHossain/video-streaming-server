/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import { API_SERVER_EVENTS } from '../constant/events';
import { blobServiceClient } from '../shared/azure';
import EventEmitter from '../shared/event-manager';
import RabbitMQ from '../shared/rabbitMQ';
import initiateVideoProcessing from './initiateVideoProcessing';

const getVideoMetadata = async (): Promise<any> => {
  await RabbitMQ.consume(
    API_SERVER_EVENTS.GET_VIDEO_METADATA_EVENT,
    (msg, ack) => {
      const data = JSON.parse(msg.content.toString());
      console.log('vide doe metad', data);
      ack();
      EventEmitter.emit('videoMetadata', data);
    },
  );
};

async function downloadBlob(
  containerName: string,
  blobName: string,
  userId: string,
) {
  await getVideoMetadata();

  let videoMetadata;
  EventEmitter.on('videoMetadata', (data) => {
    videoMetadata = data;
  });

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const rootFolder = path.resolve('./');
  let uploadFolder = '';
  if (!uploadFolder) {
    uploadFolder = `container-${new Date().getTime()}`;
  }
  const rootDidrectory = `${rootFolder}/uploads/${uploadFolder}/videos`;
  fs.mkdirSync(rootDidrectory, { recursive: true });

  const downloadBlockBlobResponse = await blockBlobClient.download(0);

  const buffer = await streamToBuffer(
    downloadBlockBlobResponse.readableStreamBody,
  );

  // write buffer to disk
  // Assuming `buffer` is your data
  const downloadPath = path.join(rootDidrectory, blobName);
  if (buffer instanceof Buffer) {
    fs.writeFileSync(downloadPath, buffer);
  } else {
    console.error('Data is not a Buffer');
  }

  const destination = path
    .normalize(path.join('uploads', uploadFolder, 'videos', blobName))
    .replace(/\\/g, '/');

  const videoPath = path.join('uploads', uploadFolder, 'videos', blobName);
  console.log('Downloaded blob content to:', JSON.stringify(destination));

  // intiate video conversion
  await initiateVideoProcessing({
    videoPath,
    destination,
    userId,
    videoMetadata,
  });
}

function streamToBuffer(readableStream: NodeJS.ReadableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}

export default downloadBlob;

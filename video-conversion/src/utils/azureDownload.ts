import fs from 'fs';
import path from 'path';
import { blobServiceClient } from '../shared/azure';
import streamToBuffer from './streamToBuffer';

interface IAzure {
  containerName: string;
  blobName: string;
  uploadFolder: string;
}

const azureDownload = async ({
  containerName,
  blobName,
  uploadFolder,
}: IAzure) => {
  const rootFolder = path.resolve('./');

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadBlockBlobResponse = await blockBlobClient.download(0);

  const buffer = await streamToBuffer(
    downloadBlockBlobResponse.readableStreamBody,
  );

  const rootDidrectory = `${rootFolder}/uploads/${uploadFolder}/videos`;
  fs.mkdirSync(rootDidrectory, { recursive: true });

  // write buffer to disk
  const downloadPath = path.join(rootDidrectory, blobName);
  if (buffer instanceof Buffer) {
    fs.writeFileSync(downloadPath, buffer);
  } else {
    console.error('Data is not a Buffer');
  }

  console.log('Downloaded blob content to:', JSON.stringify(downloadPath));
};

export default azureDownload;

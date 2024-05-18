import { BlobServiceClient } from '@azure/storage-blob';
import config from '../config';
import ApiError from '../errors/apiError';

const azureUpload = async (
  file: Express.Multer.File,
  containerName: string,
) => {
  console.log('azureUpload called', file, containerName);

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      config.azure.storage_connection_string,
    );
    // Check if container exists

    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({
      access: 'container',
    });

    console.log(file, 'file inside azureUpload');

    // Create blob client for the specific file location
    const blockBlobClient = containerClient.getBlockBlobClient(file.filename);

    // Read the file from disk
    const buffer = file.buffer;

    // Upload data to the blob
    const response = await blockBlobClient.upload(buffer, buffer.length);
    return response;
  } catch (error) {
    console.log('Got error while uploading to azure', error);
    throw new ApiError(500, 'Error while uploading to azure');
  }
};

export default azureUpload;

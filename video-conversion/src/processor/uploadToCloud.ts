/* eslint-disable @typescript-eslint/no-explicit-any */
import { promises as fsPromises } from 'fs';
import path from 'path';
import { API_GATEWAY_EVENTS } from '../constant/events';
import ApiError from '../errors/apiError';
import { blobServiceClient } from '../shared/azure';
import { errorLogger, logger } from '../shared/logger';
import RabbitMQ from '../shared/rabbitMQ';

const uploadProcessedFile = async (
  rootFolder: string,
  folderPath: string,
  bucketName: string,
  data: any,
) => {
  const absoluteFolderPath = path.join(rootFolder, folderPath);
  const files = await fsPromises.readdir(absoluteFolderPath);

  try {
    for (const file of files) {
      const filePath = path.join(absoluteFolderPath, file);
      const key = file;

      const fileData = await fsPromises.readFile(filePath);

      const containerName = bucketName;

      // Check if container exists
      const containerClient =
        blobServiceClient.getContainerClient(containerName);

      await containerClient.createIfNotExists({
        access: 'container',
      });

      // Create blob client for the specific file location
      const blockBlobClient = containerClient.getBlockBlobClient(key);
      // Upload data to the blob
      const uploadBlobResponse = await blockBlobClient.upload(
        fileData,
        fileData.length,
      );
      logger.info(
        `Uploaded block blob ${key} successfully`,
        uploadBlobResponse.requestId,
      );

      const uploadProgress = {
        userId: data.userId,
        status: 'processing',
        name: 'AWS Bucket uploading',
        message: 'Video upload progressing',
        fileName: data.fileName,
        // progress: 'Uploading',
      };

      RabbitMQ.sendToQueue(
        API_GATEWAY_EVENTS.NOTIFY_AWS_S3_UPLOAD_PROGRESS,
        uploadProgress,
      );
    }
  } catch (error) {
    errorLogger.error('Error uploading folder:', error);
    const failedProgress = {
      userId: data.userId,
      status: 'failed',
      message: 'Video uploading failed',
    };
    RabbitMQ.sendToQueue(
      API_GATEWAY_EVENTS.NOTIFY_AWS_S3_UPLOAD_FAILED,
      failedProgress,
    );
    throw new ApiError(500, 'Video uploading to Space failed');
  }
};

export default uploadProcessedFile;

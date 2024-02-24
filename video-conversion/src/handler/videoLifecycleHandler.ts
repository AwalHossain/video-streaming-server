import { promises as fsPromises } from 'fs';

import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';

import path from 'path';
/// here i am going to update the vidoe history and add the path after each processing

import dotenv from 'dotenv';
import fsextra from 'fs-extra';
import { EVENT } from '../app/events/event.constant';
import config from '../config';
import { NOTIFY_EVENTS, QUEUE_EVENTS } from '../constant/queueEvents';
import ApiError from '../errors/apiError';
import { io } from '../server';
import EventEmitter from '../shared/event-manager';
import { errorLogger, logger } from '../shared/logger';
import { RedisClient } from '../shared/redis';
// import { VIDEO_STATUS } from "./video.constant";
// import { VideoService } from "./video.service";
dotenv.config();

const videoLifecycleHandler = async () => {
  const accountName = config.azure.accountName;
  const accountKey = config.azure.accountKey;

  try {
    const storageAccountBaseUrl = `https://${accountName}.blob.core.windows.net`;
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey,
    );

    const blobServiceClient = new BlobServiceClient(
      storageAccountBaseUrl,
      sharedKeyCredential,
    );

    Object.values(QUEUE_EVENTS).forEach((queueName) => {
      EventEmitter.on(queueName, async (data) => {
        if (queueName === QUEUE_EVENTS.VIDEO_UPLOADED) {
          logger.info(data, 'upload data........');
        }

        if (queueName === QUEUE_EVENTS.VIDEO_PROCESSED) {
          // await VideoService.updateHistory(data.id, {
          //   history: { status: queueName, createdAt: Date.now() },
          // });
          const sendData = {
            id: data.id,
            history: { status: queueName, createdAt: Date.now() },
          };
          RedisClient.publish(
            EVENT.VIDEO_PROCESSED_EVENT,
            JSON.stringify(sendData),
          );
        }

        if (queueName === QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED) {
          // await VideoService.updateHistory(data.id, {
          //   history: { status: queueName, createdAt: Date.now() },
          // });
          const sendData = {
            id: data.id,
            history: { status: queueName, createdAt: Date.now() },
          };
          RedisClient.publish(
            EVENT.VIDEO_THUMBNAIL_GENERATED_EVENT,
            JSON.stringify(sendData),
          );
        }

        // upload the processed file to s3
        const uploadProcessedFile = async (
          folderPath: string,
          bucketName: string,
        ) => {
          const files = await fsPromises.readdir(folderPath);

          try {
            for (const file of files) {
              const filePath = path.join(folderPath, file);
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

              io.to(data.userId).emit(
                NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_PROGRESS,
                {
                  status: 'processing',
                  name: 'AWS Bucket uploading',
                  message: 'Video upload progressing',
                  fileName: data.fileName,
                  // progress: 'Uploading',
                },
              );
            }
          } catch (error) {
            errorLogger.error('Error uploading folder:', error);
            io.to(data.userId).emit(NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_FAILED, {
              status: 'failed',
              message: 'Video uploading failed',
            });

            throw new ApiError(500, 'Video uploading to Space failed');
          }
        };

        if (queueName === QUEUE_EVENTS.VIDEO_HLS_CONVERTED) {
          // await VideoService.updateHistory(data.id, {
          //   history: { status: queueName, createdAt: Date.now() },
          // });

          const sendData = {
            id: data.id,
            history: { status: queueName, createdAt: Date.now() },
          };
          RedisClient.publish(
            EVENT.VIDEO_HLS_CONVERTED_EVENT,
            JSON.stringify(sendData),
          );

          const rootFolder = path.resolve('./');
          // destination: 'uploads/videoplayback_1693755779611
          const file = data.destination.split('/')[1];
          const deletedFolder = path.join(rootFolder, `./uploads/${file}`);
          const folderPath1 = path.join(rootFolder, `./uploads/${file}/hls`);
          const folderPath2 = path.join(
            rootFolder,
            `./uploads/${file}/thumbnails`,
          );
          logger.info(
            'i am the hls converted handler!',
            data.path,
            'checking',
            folderPath1,
          );

          try {
            await Promise.all([
              uploadProcessedFile(folderPath1, `${file}`),
              uploadProcessedFile(folderPath2, `${file}`),
            ]);

            //   await VideoService.updateHistory(data.id, {
            //     history: { status: "Successfully uploaded to the S3 bucket.", createdAt: Date.now() },
            //   });

            io.to(data.userId).emit(
              NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_PROGRESS,
              {
                status: 'completed',
                name: 'AWS Bucket uploading',
                message: 'Video upload completed',
                fileName: data.fileName,
              },
            );
            io.to(data.userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_PUBLISHED, {
              status: 'success',
              name: 'Video published',
              message: 'Video published',
            });

            //   await VideoService.update(data.id, {
            //     status: VIDEO_STATUS.PUBLISHED,
            //     videoLink: `https://mern-video-bucket.sgp1.cdn.digitaloceanspaces.com/${file}/${data.fileName}_master.m3u8`,
            //     thumbnailUrl: `https://mern-video-bucket.sgp1.cdn.digitaloceanspaces.com/${file}/${data.fileName}.png`,
            //   })

            const sendData = {
              id: data.id,
              history: {
                status: 'published',
                videoLink: `https://mernvideo.blob.core.windows.net/${file}/${data.fileName}_master.m3u8`,
                thumbnailUrl: `https://mernvideo.blob.core.windows.net/${file}/${data.fileName}.png`,
              },
            };

            RedisClient.publish(
              EVENT.VIDEO_PROCESSED_EVENT,
              JSON.stringify(sendData),
            );

            // Delete the folder after uploading all files
            await fsextra.remove(deletedFolder);
            logger.info(`Deleted folder: ${deletedFolder}`);
          } catch (error) {
            errorLogger.error(error, 'error');
            io.to(data.userId).emit(NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_FAILED, {
              status: 'failed',
              message: 'Video uploading failed',
            });
            throw new ApiError(500, 'Video uploading to Space failed');
          }
        }
      });
    });
  } catch (error) {
    errorLogger.error(error, 'error');
    throw new ApiError(500, 'Video lifecycle handler failed');
  }
};
export default videoLifecycleHandler;

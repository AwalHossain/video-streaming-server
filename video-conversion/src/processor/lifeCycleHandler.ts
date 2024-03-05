// import { promises as fsPromises } from 'fs';
// import path from 'path';
// /// here i am going to update the vidoe history and add the path after each processing

// import dotenv from 'dotenv';
// import { QUEUE_EVENTS } from '../constant/events';
// import ApiError from '../errors/apiError';
// import { blobServiceClient } from '../shared/azure';
// import EventEmitter from '../shared/event-manager';

// dotenv.config();

// const setupVideoHandler = async () => {
//   Object.values(QUEUE_EVENTS).forEach((queueName) => {
//     console.log(queueName, 'queueName...from video handler');
//     EventEmitter.on(queueName, async (data) => {
//       if (queueName === QUEUE_EVENTS.VIDEO_UPLOADED) {
//         console.log(data, 'upload data........');
//       }

//       if (queueName === QUEUE_EVENTS.VIDEO_PROCESSED) {
//         // await VideoService.updateHistory(data.id, {
//         //   history: { status: queueName, createdAt: Date.now() },
//         // });
//         console.log(data, 'processed data........');
//       }

//       if (queueName === QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED) {
//         // await VideoService.updateHistory(data.id, {
//         //   history: { status: queueName, createdAt: Date.now() },
//         // });
//         console.log(data, 'thumbnail data........');
//       }

//       // upload the processed file to s3
//       const uploadProcessedFile = async (
//         folderPath: string,
//         bucketName: string,
//       ) => {
//         const files = await fsPromises.readdir(folderPath);
//         console.log(files, 'file checking');
//         try {
//           for (const file of files) {
//             const filePath = path.join(folderPath, file);
//             const key = file;

//             const fileData = await fsPromises.readFile(filePath);

//             const containerName = bucketName;

//             // Check if container exists
//             const containerClient =
//               blobServiceClient.getContainerClient(containerName);

//             await containerClient.createIfNotExists({
//               access: 'container',
//             });

//             // Create blob client for the specific file location
//             const blockBlobClient = containerClient.getBlockBlobClient(key);
//             // Upload data to the blob
//             const uploadBlobResponse = await blockBlobClient.upload(
//               fileData,
//               fileData.length,
//             );
//             console.log(
//               `Uploaded block blob ${key} successfully`,
//               uploadBlobResponse.requestId,
//             );

//             // const upload = new Upload({
//             //   client: s3,
//             //   params: {
//             //     Bucket: bucketName,
//             //     Key: key,
//             //     Body: fileData,
//             //     ACL: "public-read",
//             //   },
//             // });

//             // io.to(data.userId).emit(
//             //   NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_PROGRESS,
//             //   {
//             //     status: 'processing',
//             //     name: 'AWS Bucket uploading',
//             //     message: 'Video upload progressing',
//             //     fileName: data.fileName,
//             //     // progress: 'Uploading',
//             //   },
//             // );
//           }
//         } catch (error) {
//           console.error('Error uploading folder:', error);
//           //   io.to(data.userId).emit(NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_FAILED, {
//           //     status: 'failed',
//           //     message: 'Video uploading failed',
//           //   });
//         }
//       };

//       if (queueName === QUEUE_EVENTS.VIDEO_HLS_CONVERTED) {
//         // await VideoService.updateHistory(data.id, {
//         //   history: { status: queueName, createdAt: Date.now() },
//         // });

//         const rootFolder = path.resolve('./');
//         // destination: 'uploads/videoplayback_1693755779611
//         const file = data.destination.split('\\')[1];
//         const deletedFolder = path.join(rootFolder, `./uploads/${file}`);
//         const folderPath1 = path.join(rootFolder, `./uploads/${file}/hls`);
//         const folderPath2 = path.join(
//           rootFolder,
//           `./uploads/${file}/thumbnails`,
//         );
//         const bucketName = `bucket-${Date.now()}`;

//         console.log(
//           'i am the hls converted handler!',
//           data.path,
//           'checking',
//           folderPath1,
//         );

//         try {
//           await Promise.all([
//             uploadProcessedFile(folderPath1, `${file}`),
//             uploadProcessedFile(folderPath2, `${file}`),
//           ]);

//           //   await VideoService.updateHistory(data.id, {
//           //     history: {
//           //       status: 'Successfully uploaded to the S3 bucket.',
//           //       createdAt: Date.now(),
//           //     },
//           //   });

//           //   io.to(data.userId).emit(NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_PROGRESS, {
//           //     status: 'completed',
//           //     name: 'AWS Bucket uploading',
//           //     message: 'Video upload completed',
//           //     fileName: data.fileName,
//           //     // progress: 100,
//           //   });
//           //   io.to(data.userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_PUBLISHED, {
//           //     status: 'success',
//           //     name: 'Video published',
//           //     message: 'Video published',
//           //   });

//           //   await VideoService.update(data.id, {
//           //     status: VIDEO_STATUS.PUBLISHED,
//           //     videoLink: `https://mernvideo.blob.core.windows.net/${bucketName}/${data.fileName}_master.m3u8`,
//           //     thumbnailUrl: `https://mernvideo.blob.core.windows.net/${bucketName}/${data.fileName}.png`,
//           //   });

//           const publish = {
//             videoLink: `https://mernvideo.blob.core.windows.net/${file}/${data.fileName}_master.m3u8`,
//             thumbnailUrl: `https://mernvideo.blob.core.windows.net/${file}/${data.fileName}.png`,
//           };
//           console.log(publish, 'publishing data');

//           // Delete the folder after uploading all files
//           // await fsextra.remove(deletedFolder);
//           console.log(`Deleted folder: ${deletedFolder}`);
//         } catch (error) {
//           console.log(error, 'error');
//           //   io.to(data.userId).emit(NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_FAILED, {
//           //     status: 'failed',
//           //     message: 'Video uploading failed',
//           //   });
//           throw new ApiError(500, 'Video uploading to Space failed');
//         }
//       }
//     });
//   });
// };
// export default setupVideoHandler;

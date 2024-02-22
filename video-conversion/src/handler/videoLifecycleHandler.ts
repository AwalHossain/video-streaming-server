
import { promises as fsPromises } from "fs";
import path from "path";
/// here i am going to update the vidoe history and add the path after each processing

import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from 'dotenv';
import fsextra from 'fs-extra';
import ApiError from "../errors/apiError";
import EventEmitter from "../shared/event-manager";
import { io } from "../server";
import { NOTIFY_EVENTS, QUEUE_EVENTS } from "../constant/queueEvents";
// import { VIDEO_STATUS } from "./video.constant";
// import { VideoService } from "./video.service";
dotenv.config();


const videoLifecycleHandler = async () => {
  const s3 = new S3Client({
    forcePathStyle: false,
    endpoint: process.env.ENDPOINT,
    region: process.env.REGION, // 'us-east-1',
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_KEY,
    },
  });

  Object.values(QUEUE_EVENTS).forEach((queueName) => {
    EventEmitter.on(queueName, async (data) => {

      if (queueName === QUEUE_EVENTS.VIDEO_UPLOADED) {
        console.log(data, 'upload data........');
      }

      if (queueName === QUEUE_EVENTS.VIDEO_PROCESSED) {
        // await VideoService.updateHistory(data.id, {
        //   history: { status: queueName, createdAt: Date.now() },
        // });
      }

      if (queueName === QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED) {
        // await VideoService.updateHistory(data.id, {
        //   history: { status: queueName, createdAt: Date.now() },
        // });
      }

      // upload the processed file to s3
      const uploadProcessedFile = async (folderPath: string, bucketName: string) => {
        const files = await fsPromises.readdir(folderPath);
        console.log(files, 'file checking');
        try {

          for (const file of files) {
            const filePath = path.join(folderPath, file);
            const key = file;

            const fileData = await fsPromises.readFile(filePath);

            const upload = new Upload({
              client: s3,
              params: {
                Bucket: bucketName,
                Key: key,
                Body: fileData,
                ACL: "public-read",
              },
            });


            upload.on("httpUploadProgress", () => {
              // const percentage = Math.round((progress.loaded / progress.total) * 100);
              io.to(data.userId).emit(NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_PROGRESS, {
                status: "processing",
                name: "AWS Bucket uploading",
                message: "Video upload progressing",
                fileName: data.fileName,
                // progress: 'Uploading',
              })
            })

            const result = await upload.done();
            console.log(`Uploaded: ${key}`, result);

          }

        } catch (error) {
          console.error("Error uploading folder:", error);
          io.to(data.userId).emit(NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_FAILED, {
            status: "failed",
            message: "Video uploading failed",
          })
        }


      }

      if (queueName === QUEUE_EVENTS.VIDEO_HLS_CONVERTED) {

        // await VideoService.updateHistory(data.id, {
        //   history: { status: queueName, createdAt: Date.now() },
        // });


        const rootFolder = path.resolve('./');
        // destination: 'uploads/videoplayback_1693755779611
        const file = data.destination.split('/')[1];
        const deletedFolder = path.join(rootFolder, `./uploads/${file}`);
        const folderPath1 = path.join(rootFolder, `./uploads/${file}/hls`);
        const folderPath2 = path.join(rootFolder, `./uploads/${file}/thumbnails`);
        console.log("i am the hls converted handler!", data.path, 'checking', folderPath1);

        try {
          await Promise.all([
            uploadProcessedFile(folderPath1, `${file}`),
            uploadProcessedFile(folderPath2, `${file}`)
          ]);

        //   await VideoService.updateHistory(data.id, {
        //     history: { status: "Successfully uploaded to the S3 bucket.", createdAt: Date.now() },
        //   });

          io.to(data.userId).emit(NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_PROGRESS, {
            status: "completed",
            name: "AWS Bucket uploading",
            message: "Video upload completed",
            fileName: data.fileName,
          })
          io.to(data.userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_PUBLISHED, {
            status: "success",
            name: "Video published",
            message: "Video published"
          })

        //   await VideoService.update(data.id, {
        //     status: VIDEO_STATUS.PUBLISHED,
        //     videoLink: `https://mern-video-bucket.sgp1.cdn.digitaloceanspaces.com/${file}/${data.fileName}_master.m3u8`,
        //     thumbnailUrl: `https://mern-video-bucket.sgp1.cdn.digitaloceanspaces.com/${file}/${data.fileName}.png`,
        //   })

          // Delete the folder after uploading all files
          await fsextra.remove(deletedFolder);
          console.log(`Deleted folder: ${deletedFolder}`);
        } catch (error) {
          console.log(error, 'error');
          io.to(data.userId).emit(NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_FAILED, {
            status: "failed",
            message: "Video uploading failed",
          })
          throw new ApiError(500, "Video uploading to Space failed");
        }


      }

    })
  })
}
export default videoLifecycleHandler;
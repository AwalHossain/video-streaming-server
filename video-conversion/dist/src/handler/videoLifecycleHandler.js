"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
/// here i am going to update the vidoe history and add the path after each processing
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const apiError_1 = __importDefault(require("../errors/apiError"));
const event_manager_1 = __importDefault(require("../shared/event-manager"));
const server_1 = require("../server");
const queueEvents_1 = require("../constant/queueEvents");
// import { VIDEO_STATUS } from "./video.constant";
// import { VideoService } from "./video.service";
dotenv_1.default.config();
const videoLifecycleHandler = async () => {
    const s3 = new client_s3_1.S3Client({
        forcePathStyle: false,
        endpoint: process.env.ENDPOINT,
        region: process.env.REGION, // 'us-east-1',
        credentials: {
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SECRET_KEY,
        },
    });
    Object.values(queueEvents_1.QUEUE_EVENTS).forEach((queueName) => {
        console.log(queueName, 'queueName...from video handler');
        event_manager_1.default.on(queueName, async (data) => {
            if (queueName === queueEvents_1.QUEUE_EVENTS.VIDEO_UPLOADED) {
                console.log(data, 'upload data........');
            }
            if (queueName === queueEvents_1.QUEUE_EVENTS.VIDEO_PROCESSED) {
                // await VideoService.updateHistory(data.id, {
                //   history: { status: queueName, createdAt: Date.now() },
                // });
            }
            if (queueName === queueEvents_1.QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED) {
                // await VideoService.updateHistory(data.id, {
                //   history: { status: queueName, createdAt: Date.now() },
                // });
            }
            // upload the processed file to s3
            const uploadProcessedFile = async (folderPath, bucketName) => {
                const files = await fs_1.promises.readdir(folderPath);
                console.log(files, 'file checking');
                try {
                    for (const file of files) {
                        const filePath = path_1.default.join(folderPath, file);
                        const key = file;
                        const fileData = await fs_1.promises.readFile(filePath);
                        const upload = new lib_storage_1.Upload({
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
                            server_1.io.to(data.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_PROGRESS, {
                                status: "processing",
                                name: "AWS Bucket uploading",
                                message: "Video upload progressing",
                                fileName: data.fileName,
                                // progress: 'Uploading',
                            });
                        });
                        const result = await upload.done();
                        console.log(`Uploaded: ${key}`, result);
                    }
                }
                catch (error) {
                    console.error("Error uploading folder:", error);
                    server_1.io.to(data.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_FAILED, {
                        status: "failed",
                        message: "Video uploading failed",
                    });
                }
            };
            if (queueName === queueEvents_1.QUEUE_EVENTS.VIDEO_HLS_CONVERTED) {
                // await VideoService.updateHistory(data.id, {
                //   history: { status: queueName, createdAt: Date.now() },
                // });
                const rootFolder = path_1.default.resolve('./');
                // destination: 'uploads/videoplayback_1693755779611
                const file = data.destination.split('/')[1];
                const deletedFolder = path_1.default.join(rootFolder, `./uploads/${file}`);
                const folderPath1 = path_1.default.join(rootFolder, `./uploads/${file}/hls`);
                const folderPath2 = path_1.default.join(rootFolder, `./uploads/${file}/thumbnails`);
                console.log("i am the hls converted handler!", data.path, 'checking', folderPath1);
                try {
                    await Promise.all([
                        uploadProcessedFile(folderPath1, `${file}`),
                        uploadProcessedFile(folderPath2, `${file}`)
                    ]);
                    //   await VideoService.updateHistory(data.id, {
                    //     history: { status: "Successfully uploaded to the S3 bucket.", createdAt: Date.now() },
                    //   });
                    server_1.io.to(data.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_PROGRESS, {
                        status: "completed",
                        name: "AWS Bucket uploading",
                        message: "Video upload completed",
                        fileName: data.fileName,
                    });
                    server_1.io.to(data.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_VIDEO_PUBLISHED, {
                        status: "success",
                        name: "Video published",
                        message: "Video published"
                    });
                    //   await VideoService.update(data.id, {
                    //     status: VIDEO_STATUS.PUBLISHED,
                    //     videoLink: `https://mern-video-bucket.sgp1.cdn.digitaloceanspaces.com/${file}/${data.fileName}_master.m3u8`,
                    //     thumbnailUrl: `https://mern-video-bucket.sgp1.cdn.digitaloceanspaces.com/${file}/${data.fileName}.png`,
                    //   })
                    // Delete the folder after uploading all files
                    await fs_extra_1.default.remove(deletedFolder);
                    console.log(`Deleted folder: ${deletedFolder}`);
                }
                catch (error) {
                    console.log(error, 'error');
                    server_1.io.to(data.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_AWS_S3_UPLOAD_FAILED, {
                        status: "failed",
                        message: "Video uploading failed",
                    });
                    throw new apiError_1.default(500, "Video uploading to Space failed");
                }
            }
        });
    });
};
exports.default = videoLifecycleHandler;

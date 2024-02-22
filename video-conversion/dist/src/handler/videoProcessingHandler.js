"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRawFileToMp4WithWatermark = exports.processMp4ToHls = exports.getVideoDurationAndResolution = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const apiError_1 = __importDefault(require("../errors/apiError"));
const queueEvents_1 = require("../constant/queueEvents");
const addJobToQueue_1 = require("../queues/addJobToQueue");
const server_1 = require("../server");
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_static_1.default);
const processRawFileToMp4WithWatermark = async (filePath, outputFolder, jobData, watermarkImageFilePath) => {
    const fileExt = path_1.default.extname(filePath);
    const fileNameWithoutExt = path_1.default.basename(filePath, fileExt);
    const outputFileName = `${outputFolder}/${fileNameWithoutExt}.mp4`;
    const ffmpegCommand = (0, fluent_ffmpeg_1.default)(filePath).output(outputFileName);
    const videoMetadata = await getVideoDurationAndResolution(filePath);
    // Calculate the dimensions for the watermark image based on the video's aspect ratio.
    const videoWidth = videoMetadata.videoResolution.width;
    const videoHeight = videoMetadata.videoResolution.height;
    if (watermarkImageFilePath) {
        const watermarkAspectRatio = await getImageAspectRatio(watermarkImageFilePath);
        const [widthRatio, heightRatio] = watermarkAspectRatio.split(':').map(Number);
        const aspectRatioDecimal = widthRatio / heightRatio;
        console.log(aspectRatioDecimal, 'watermarkAspectRatio', videoMetadata, 'videoMetadata');
        const watermarkWidth = videoWidth / 9; // Adjust the scaling factor as needed.
        const watermarkHeight = watermarkWidth / aspectRatioDecimal;
        if (!aspectRatioDecimal || isNaN(aspectRatioDecimal)) {
            console.error('Invalid watermark aspect ratio');
            return;
        }
        ffmpegCommand.input(watermarkImageFilePath).complexFilter([
            `[0:v]scale=${videoWidth}:${videoHeight}[bg];` +
                `[1:v]scale=${watermarkWidth}:${watermarkHeight}[watermark];` +
                `[bg][watermark]overlay=W-w-10:10:enable='between(t,0,inf)'`,
        ]);
    }
    let lastReportedProgress = 0;
    ffmpegCommand
        .on("start", function (commandLine) {
        console.log("Spawned Ffmpeg with command: " + commandLine);
        server_1.io.to(jobData.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSING, {
            status: "processing",
            name: "Video mp4",
            fileName: fileNameWithoutExt,
            progress: 1,
            message: "Video conveting to mp4 Processing",
        });
    })
        .on("progress", function (progress) {
        if (progress.percent - lastReportedProgress >= 10) {
            lastReportedProgress = progress.percent;
            console.log("Processing: " + progress.percent + "% done");
            server_1.io.to(jobData.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSING, {
                status: "processing",
                name: "Video mp4",
                fileName: fileNameWithoutExt,
                progress: lastReportedProgress,
                message: "Video conveting to mp4 Processing",
            });
        }
    })
        .on("end", async function () {
        server_1.io.to(jobData.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSING, {
            status: "completed",
            name: "Video mp4",
            progress: 100,
            fileName: fileNameWithoutExt,
            message: "Video converting to mp4 Processing",
        });
        server_1.io.to(jobData.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSED, {
            status: "success",
            name: "Video mp4",
            fileName: fileNameWithoutExt,
            message: "Video Processed",
        });
        await (0, addJobToQueue_1.addQueueItem)(queueEvents_1.QUEUE_EVENTS.VIDEO_PROCESSED, {
            ...jobData,
            completed: true,
            path: outputFileName,
        });
    })
        .on("error", function (err) {
        server_1.io.to(jobData.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSING, {
            status: "failed",
            name: "Video Mp4 Processing",
            progress: 0,
            fileName: fileNameWithoutExt,
            message: "Video Processed failed",
        });
        console.log("An error occurred: " + err.message);
    })
        .run();
    const folderName = jobData.destination.split("/")[1];
    const uploadPath = `uploads/${folderName}/thumbnails`;
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
    generateThumbnail(filePath, uploadPath, {
        ...jobData,
        completed: true,
    });
    return;
};
exports.processRawFileToMp4WithWatermark = processRawFileToMp4WithWatermark;
const generateThumbnail = async (filePath, outputFolder, jobData) => {
    const fileExt = path_1.default.extname(filePath);
    const fileNameWithoutExt = path_1.default.basename(filePath, fileExt);
    const thumbnailFileName = `${fileNameWithoutExt}.png`;
    console.log(thumbnailFileName, 'thumbnailFileName');
    (0, fluent_ffmpeg_1.default)(filePath)
        .screenshots({
        timestamps: ['00:01'],
        filename: thumbnailFileName,
        folder: `${outputFolder}`,
        size: "320x240",
    })
        .on('end', async function () {
        console.log("hthumnail generated!", jobData.path);
        // await addQueueItem(QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED, {
        //   ...jobData,
        //   completed: true,
        //   path: thumbnailFileName
        // });
    });
    return;
};
// / Define a function to create HLS variants for different qualitie
const processMp4ToHls = async (filePath, outputFolder, jobData) => {
    const fileExt = path_1.default.extname(filePath);
    const fileNameWithoutExt = path_1.default.basename(filePath, fileExt);
    console.log(outputFolder, 'again checking output folder');
    const renditions = [
        { resolution: '854x480', bitrate: '800k', name: '480p' },
        { resolution: '1920x1080', bitrate: '5000k', name: '1080p' },
    ];
    const renditionProgress = {};
    renditions.forEach((rendition) => {
        renditionProgress[rendition.name] = 0;
    });
    let lastReportedProgress = 0;
    try {
        // Create renditions
        const promises = renditions.map((rendition) => {
            return new Promise((resolve, reject) => {
                (0, fluent_ffmpeg_1.default)(filePath)
                    .output(`${outputFolder}/${fileNameWithoutExt}_${rendition.name}.m3u8`)
                    .outputOptions([
                    `-s ${rendition.resolution}`,
                    `-c:v libx264`,
                    `-crf 23`,
                    `-preset fast`,
                    `-b:v ${rendition.bitrate}`,
                    `-g 48`,
                    `-hls_time 10`,
                    `-hls_list_size 0`,
                    `-hls_segment_filename`,
                    `${outputFolder}/${fileNameWithoutExt}_${rendition.name}_%03d.ts`,
                ])
                    .on('start', function (commandLine) {
                    console.log('Spawned Ffmpeg with command: ' + commandLine);
                    server_1.io.to(jobData.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING, {
                        status: "processing",
                        name: "Adaptive bit rate",
                        fileName: fileNameWithoutExt,
                        progress: 1,
                        message: "Adaptive bit rate",
                    });
                })
                    .on('progress', function (progress) {
                    console.log(`Processing: ${progress.percent}% done for ${rendition.name}`);
                    renditionProgress[rendition.name] = progress.percent;
                    // calculate the overall progress
                    const totalProgress = Object.values(renditionProgress).reduce((a, b) => a + b, 0);
                    const overallProgress = Math.round(totalProgress / renditions.length);
                    console.log(`Overall progress: ${overallProgress}%`);
                    if (overallProgress - lastReportedProgress >= 10) {
                        lastReportedProgress = overallProgress;
                        server_1.io.to(jobData.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING, {
                            status: "processing",
                            name: "Adaptive bit rate",
                            progress: lastReportedProgress,
                            fileName: fileNameWithoutExt,
                            message: "Adaptive bit rate Processing",
                        });
                    }
                })
                    .on('end', function () {
                    resolve();
                })
                    .on('error', function (err) {
                    console.log('An error occurred: ' + err.message);
                    server_1.io.to(jobData.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING, {
                        status: "failed",
                        name: "Adaptive bit rate",
                        progress: 0,
                        fileName: fileNameWithoutExt,
                        message: "Video hls convering Processed failed",
                    });
                    reject(err);
                })
                    .run();
            });
        });
        // Wait for all renditions to complete
        await Promise.all(promises);
        // Notify that all renditions are complete
        server_1.io.to(jobData.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING, {
            status: "completed",
            name: "Adaptive bit rate",
            fileName: fileNameWithoutExt,
            progress: 100,
            message: "Video hls convering Processed successfully",
        });
        server_1.io.to(jobData.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSED, {
            status: "success",
            name: "Adaptive bit rate",
            fileName: fileNameWithoutExt,
            message: "Video Processed successfully",
        });
        // Create master playlist file
        const masterPlaylistContent = `#EXTM3U
#EXT-X-VERSION:3
${renditions.map((rendition) => `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(rendition.bitrate)}000,RESOLUTION=${rendition.resolution}\n${fileNameWithoutExt}_${rendition.name}.m3u8`).join('\n')}
`;
        const outputFileName = `${outputFolder}/${fileNameWithoutExt}_master.m3u8`;
        fs_1.default.writeFileSync(outputFileName, masterPlaylistContent);
        (0, addJobToQueue_1.addQueueItem)(queueEvents_1.QUEUE_EVENTS.VIDEO_HLS_CONVERTED, {
            ...jobData,
            path: outputFileName,
        });
        return;
    }
    catch (err) {
        server_1.io.to(jobData.userId).emit(queueEvents_1.NOTIFY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING, {
            status: "failed",
            name: "Video hls",
            progress: 0,
            fileName: fileNameWithoutExt,
            message: "Video hls convering Processed failed",
        });
        throw new apiError_1.default(500, "Video hls converting failed");
    }
};
exports.processMp4ToHls = processMp4ToHls;
function formatDuration(durationInSeconds) {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds - (hours * 3600)) / 60);
    const seconds = Math.floor(durationInSeconds - (hours * 3600) - (minutes * 60));
    let result = "";
    if (hours > 0) {
        result += hours.toString().padStart(2, '0') + ":";
    }
    result += minutes.toString().padStart(2, '0') + ":";
    result += seconds.toString().padStart(2, '0');
    return result;
}
// get video duration & resolution
const getVideoDurationAndResolution = async (filePath) => {
    return new Promise((resolve, reject) => {
        let videoDuration = "0";
        const videoResolution = {
            width: 0,
            height: 0
        };
        fluent_ffmpeg_1.default.ffprobe(filePath, (err, metadata) => {
            if (err || !metadata) {
                reject(err);
            }
            else {
                videoDuration = formatDuration(parseInt(metadata.format.duration));
                videoResolution.width = metadata.streams[0].width;
                videoResolution.height = metadata.streams[0].height;
                resolve({ videoDuration, videoResolution });
                return;
            }
        });
    });
};
exports.getVideoDurationAndResolution = getVideoDurationAndResolution;
const getImageAspectRatio = async (filePath) => {
    return new Promise((resolve, reject) => {
        fluent_ffmpeg_1.default.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
            }
            const imageAspectRatio = metadata.streams[0].display_aspect_ratio;
            resolve(imageAspectRatio);
            return;
        });
    });
};

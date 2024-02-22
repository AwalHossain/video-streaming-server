/* eslint-disable @typescript-eslint/no-explicit-any */
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";
import ApiError from "../errors/apiError";
import { NOTIFY_EVENTS, QUEUE_EVENTS } from "../constant/queueEvents";
import { addQueueItem } from "../queues/addJobToQueue";
import { io } from "../server";



ffmpeg.setFfmpegPath(ffmpegPath)
interface JobData {
  completed: boolean;
  path: string;
  destination: string;
  userId: string;
}

interface ProcessedFile {
  fileName: string;
  outputFileName: string;
}

interface WatermarkFile {
  fileName: string;
  outputFileName: string;
  watermarkImage: string;
}

const processRawFileToMp4WithWatermark = async (
  filePath: string,
  outputFolder: string,
  jobData: JobData,
  watermarkImageFilePath?: string | null
): Promise<WatermarkFile> => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);

  const outputFileName = `${outputFolder}/${fileNameWithoutExt}.mp4`;

  const ffmpegCommand = ffmpeg(filePath).output(outputFileName);

  const videoMetadata = await getVideoDurationAndResolution(filePath);


  // Calculate the dimensions for the watermark image based on the video's aspect ratio.
  const videoWidth = videoMetadata.videoResolution.width;
  const videoHeight = videoMetadata.videoResolution.height;


  if (watermarkImageFilePath) {
    const watermarkAspectRatio = await getImageAspectRatio(watermarkImageFilePath) as any;
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
    .on("start", function (commandLine: string) {
      console.log("Spawned Ffmpeg with command: " + commandLine);
      io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSING, {
        status: "processing",
        name: "Video mp4",
        fileName: fileNameWithoutExt,
        progress: 1,
        message: "Video conveting to mp4 Processing",
      });
    })
    .on("progress", function (progress: any) {
      if (progress.percent - lastReportedProgress >= 10) {
        lastReportedProgress = progress.percent;
        console.log("Processing: " + progress.percent + "% done");
        io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSING, {
          status: "processing",
          name: "Video mp4",
          fileName: fileNameWithoutExt,
          progress: lastReportedProgress,
          message: "Video conveting to mp4 Processing",
        });
      }
    })
    .on("end", async function () {
      io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSING, {
        status: "completed",
        name: "Video mp4",
        progress: 100,
        fileName: fileNameWithoutExt,
        message: "Video converting to mp4 Processing",
      });
      io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSED, {
        status: "success",
        name: "Video mp4",
        fileName: fileNameWithoutExt,
        message: "Video Processed",
      })
      await addQueueItem(QUEUE_EVENTS.VIDEO_PROCESSED, {
        ...jobData,
        completed: true,
        path: outputFileName,
      });

    })
    .on("error", function (err: Error) {
      io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_PROCESSING, {
        status: "failed",
        name: "Video Mp4 Processing",
        progress: 0,
        fileName: fileNameWithoutExt,
        message: "Video Processed failed",
      })
      console.log("An error occurred: " + err.message);
    })
    .run();

  const folderName = jobData.destination.split("/")[1];
  const uploadPath = `uploads/${folderName}/thumbnails`;
  fs.mkdirSync(uploadPath, { recursive: true });

  generateThumbnail(filePath, uploadPath, {
    ...jobData,
    completed: true,
  });

  return;
};


const generateThumbnail = async (
  filePath: string,
  outputFolder: string,
  jobData: JobData
): Promise<ProcessedFile> => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);
  const thumbnailFileName = `${fileNameWithoutExt}.png`;
  console.log(thumbnailFileName, 'thumbnailFileName');
  ffmpeg(filePath)
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
    })
  return;

};


// / Define a function to create HLS variants for different qualitie



const processMp4ToHls = async (
  filePath: string,
  outputFolder: string,
  jobData: JobData
): Promise<ProcessedFile> => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);
  console.log(outputFolder, 'again checking output folder');

  const renditions = [
    { resolution: '854x480', bitrate: '800k', name: '480p' },
    { resolution: '1920x1080', bitrate: '5000k', name: '1080p' },
  ];

  const renditionProgress: { [key: string]: number } = {};

  renditions.forEach((rendition) => {
    renditionProgress[rendition.name] = 0;
  });

  let lastReportedProgress = 0;
  try {
    // Create renditions
    const promises = renditions.map((rendition) => {
      return new Promise<void>((resolve, reject) => {
        ffmpeg(filePath)
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
          .on('start', function (commandLine: string) {
            console.log('Spawned Ffmpeg with command: ' + commandLine);
            io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING, {
              status: "processing",
              name: "Adaptive bit rate",
              fileName: fileNameWithoutExt,
              progress: 1,
              message: "Adaptive bit rate",

            })
          })
          .on('progress', function (progress: any) {
            console.log(`Processing: ${progress.percent}% done for ${rendition.name}`);



            renditionProgress[rendition.name] = progress.percent;

            // calculate the overall progress
            const totalProgress = Object.values(renditionProgress).reduce((a, b) => a + b, 0);
            const overallProgress = Math.round(totalProgress / renditions.length);
            console.log(`Overall progress: ${overallProgress}%`);

            if (overallProgress - lastReportedProgress >= 10) {
              lastReportedProgress = overallProgress;

              io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING, {
                status: "processing",
                name: "Adaptive bit rate",
                progress: lastReportedProgress,
                fileName: fileNameWithoutExt,
                message: "Adaptive bit rate Processing",

              })
            }
          })
          .on('end', function () {
            resolve();
          })
          .on('error', function (err: Error) {
            console.log('An error occurred: ' + err.message);
            io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING, {
              status: "failed",
              name: "Adaptive bit rate",
              progress: 0,
              fileName: fileNameWithoutExt,
              message: "Video hls convering Processed failed",
            })

            reject(err);
          })
          .run();
      });
    });

    // Wait for all renditions to complete
    await Promise.all(promises);

    // Notify that all renditions are complete
    io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING, {
      status: "completed",
      name: "Adaptive bit rate",
      fileName: fileNameWithoutExt,
      progress: 100,
      message: "Video hls convering Processed successfully",
    })
    io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSED, {
      status: "success",
      name: "Adaptive bit rate",
      fileName: fileNameWithoutExt,
      message: "Video Processed successfully",
    })

    // Create master playlist file
    const masterPlaylistContent = `#EXTM3U
#EXT-X-VERSION:3
${renditions.map(
      (rendition) => `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(rendition.bitrate)}000,RESOLUTION=${rendition.resolution}\n${fileNameWithoutExt}_${rendition.name}.m3u8`
    ).join('\n')}
`;
    const outputFileName = `${outputFolder}/${fileNameWithoutExt}_master.m3u8`;
    fs.writeFileSync(outputFileName, masterPlaylistContent);

    addQueueItem(QUEUE_EVENTS.VIDEO_HLS_CONVERTED, {
      ...jobData,
      path: outputFileName,
    });


    return;
  } catch (err) {
    io.to(jobData.userId).emit(NOTIFY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING, {
      status: "failed",
      name: "Video hls",
      progress: 0,
      fileName: fileNameWithoutExt,
      message: "Video hls convering Processed failed",
    })

    throw new ApiError(500, "Video hls converting failed")
  }

};


function formatDuration(durationInSeconds: number): string {
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

const getVideoDurationAndResolution = async (filePath: string): Promise<{ videoDuration: string, videoResolution: { width: number, height: number } }> => {

  return new Promise((resolve, reject) => {

    let videoDuration = "0";
    const videoResolution = {
      width: 0,
      height: 0
    };

    ffmpeg.ffprobe(filePath, (err: Error, metadata: any) => {
      if (err || !metadata) {
        reject(err);
      } else{
        videoDuration = formatDuration(parseInt(metadata.format.duration));
        videoResolution.width = metadata.streams[0].width;
        videoResolution.height = metadata.streams[0].height;
        resolve({ videoDuration, videoResolution });
        return;
      }
    });
  });
}


const getImageAspectRatio = async (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err: any, metadata: any) => {
      if (err) {
        reject(err);
      }
      const imageAspectRatio = metadata.streams[0].display_aspect_ratio;
      resolve(imageAspectRatio);
      return;
    });
  });
}




export { getVideoDurationAndResolution, processMp4ToHls, processRawFileToMp4WithWatermark };


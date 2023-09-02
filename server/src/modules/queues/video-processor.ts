/** execute function will take a filePath and run  ffmpeg command to convert it to mp4 */
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { QUEUE_EVENTS } from "./constants";
import { addQueueItem } from "./queue";
interface JobData {
  completed: boolean;
  path: string;
  destination: string;
  // other properties
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
  watermarkImageFilePath?: string
): Promise<WatermarkFile> => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);

  const outputFileName = `${outputFolder}/${fileNameWithoutExt}.mp4`;

  const ffmpegCommand = ffmpeg(filePath).output(outputFileName);

  if (watermarkImageFilePath) {
    ffmpegCommand.input(watermarkImageFilePath).complexFilter([
      "[0:v]scale=640:-1[bg];" +
        "[1:v]scale=iw/10:ih/10[watermark];" +
        "[bg][watermark]overlay=W-w-10:H-h-10:enable='between(t,0,30)'",
    ]);
  }

  ffmpegCommand
    .on("start", function (commandLine: string) {
      console.log("Spawned Ffmpeg with command: " + commandLine);
    })
    .on("progress", function (progress: any) {
      console.log("Processing: " + progress.percent + "% done");
    })
    .on("end", async function () {
      console.log("Finished processing");

      await addQueueItem(QUEUE_EVENTS.VIDEO_PROCESSED, {
        ...jobData,
        completed: true,
        path: outputFileName,
      });

      if (watermarkImageFilePath) {
        await addQueueItem(QUEUE_EVENTS.VIDEO_WATERMARKED, {
          ...jobData,
          completed: true,
          path: outputFileName,
        });
      }
    })
    .on("error", function (err: Error) {
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

// const processMp4ToWatermark = async (
//   filePath: string,
//   outputFolder: string,
//   watermarkImageFilePath: string,
//   jobData: JobData

// ): Promise<WatermarkFile> => {
//   const fileName = path.basename(filePath);
//   const fileExt = path.extname(filePath);
//   const fileNameWithoutExt = path.basename(filePath, fileExt);

//   const outputFileName = `${outputFolder}/${fileNameWithoutExt}.mp4`;
//   // const watermarkImage = fs.readFileSync(watermarkImageFilePath);

//   console.log(outputFileName, watermarkImageFilePath,'watermarkImageFilePath');

//   ffmpeg(filePath)
//     .input(watermarkImageFilePath)
//     .complexFilter([
//       "[0:v]scale=640:-1[bg];" +
//       "[1:v]scale=iw/10:ih/10[watermark];" +
//       "[bg][watermark]overlay=W-w-10:H-h-10:enable='between(t,0,30)'"
//     ])
//     .output(outputFileName)
//     .on("start", function (commandLine: string) {
//       console.log("Video watermarking has started: " + commandLine);
//     })
//     .on("progress", function (progress: any) {
//       console.log("Processing: " + progress.percent + "% done");
//     }
//     )
//     .on("end", function () {
//       console.log("Finished WaterMarkepd sucessfully");
//       addQueueItem(QUEUE_EVENTS.VIDEO_WATERMARKED, {
//         ...jobData,
//         completed: true,
//         path: outputFileName,
//       });
//     })
//     .on("error", function (err: Error) {
//       console.log("An error occurred: " + err.message);
//     }
//     )
//     .run();
  
//   return;
      
// }

const generateThumbnail = async (
  filePath: string,
  outputFolder: string,
  jobData: JobData
): Promise<ProcessedFile> => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);
  const thumbnailFileName =  `${fileNameWithoutExt}.png`;
  const outputFileName = `${outputFolder}/${thumbnailFileName}`;
  console.log(thumbnailFileName, 'thumbnailFileName');
    ffmpeg(filePath)
    .screenshots({
      timestamps: ['00:01'],
      filename:thumbnailFileName,
      folder: `${outputFolder}`,
      // size: "320x240",
    })
    .on('end', async function () {
      console.log("hthumnail generated!",jobData.path);
      await addQueueItem(QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED, {
        ...jobData,
        completed: true,
        path: thumbnailFileName
      });
    })
  return;   

};


const processMp4ToHls = async (
  filePath: string,
  outputFolder: string,
  jobData: JobData
): Promise<ProcessedFile> => {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);

  const outputFileName = `${outputFolder}/${fileNameWithoutExt}.m3u8`;

  ffmpeg(filePath)
    .output(outputFileName)
    .outputOptions([
      "-hls_time 10",
      "-hls_list_size 0",
      "-hls_flags delete_segments",
      "-hls_segment_filename",
      `${outputFolder}/${fileNameWithoutExt}_%03d.ts`,
    ])
    .on("start", function (commandLine: string) {
      console.log("Spawned Ffmpeg with command: " + commandLine);
    })
    .on("progress", function (progress: any) {
      console.log("hls Processing: " + progress.percent + "% done");
    })
    .on("end", function () {
      console.log("Finished processing hls", outputFileName);
      addQueueItem(QUEUE_EVENTS.VIDEO_HLS_CONVERTED, {
        ...jobData,
        path: outputFileName,
      });
    })
    .on("error", function (err: Error) {
      console.log("An error occurred: " + err.message);
    })
    .run();

  return;
};



export { processMp4ToHls, processRawFileToMp4WithWatermark };


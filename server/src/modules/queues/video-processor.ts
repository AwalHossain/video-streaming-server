/** execute function will take a filePath and run  ffmpeg command to convert it to mp4 */
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { QUEUE_EVENTS } from "./constants";
import { addQueueItem } from "./queue";

interface JobData {
  completed: boolean;
  path: string;
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

const processRawFileToMp4 = async (
  filePath: string,
  outputFolder: string,
  jobData: JobData,
): Promise<ProcessedFile> => {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);

  const outputFileName = `${outputFolder}/${fileNameWithoutExt}.mp4`;
  

  ffmpeg(filePath)
    .output(outputFileName)
    .on("start", function (commandLine: string) {
      console.log("Spawned Ffmpeg with command: " + commandLine);
    })
    .on("progress", function (progress: any) {
      console.log("Processing: " + progress.percent + "% done");
    })
    .on("end", function () {
      console.log("Finished processing");
      addQueueItem(QUEUE_EVENTS.VIDEO_PROCESSED, {
        ...jobData,
        completed: true,
        path: outputFileName,
      });
    })
    .on("error", function (err: Error) {
      console.log("An error occurred: " + err.message);
    })
    .run();

  return;
};

const processMp4ToWatermark = async (
  filePath: string,
  outputFolder: string,
  watermarkImageFilePath: string,
  jobData: JobData

): Promise<WatermarkFile> => {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);

  const outputFileName = `${outputFolder}/${fileNameWithoutExt}.mp4`;
  // const watermarkImage = fs.readFileSync(watermarkImageFilePath);

  console.log(outputFileName, watermarkImageFilePath,'watermarkImageFilePath');

  ffmpeg(filePath)
    .input(watermarkImageFilePath)
    .complexFilter([
      "[0:v]scale=640:-1[bg];" +
      "[1:v]scale=iw/10:ih/10[watermark];" +
      "[bg][watermark]overlay=W-w-10:H-h-10:enable='between(t,0,30)'"
    ])
    .output(outputFileName)
    .on("start", function (commandLine: string) {
      console.log("Video watermarking has started: " + commandLine);
    })
    .on("progress", function (progress: any) {
      console.log("Processing: " + progress.percent + "% done");
    }
    )
    .on("end", function () {
      console.log("Finished WaterMarkepd sucessfully");
      addQueueItem(QUEUE_EVENTS.VIDEO_WATERMARKED, {
        ...jobData,
        completed: true,
        path: outputFileName,
      });
    })
    .on("error", function (err: Error) {
      console.log("An error occurred: " + err.message);
    }
    )
    .run();
  
  return;
      
}

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
      console.log("Processing: " + progress.percent + "% done");
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

export { processMp4ToHls, processMp4ToWatermark, processRawFileToMp4 };


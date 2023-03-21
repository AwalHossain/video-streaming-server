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

const processRawFileToMp4 = async (
  filePath: string,
  outputFolder: string,
  jobData: JobData
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
export const addWatermark = async (
  filePath: string,
  outputFolder: string,
  watermarkPath: string
): Promise<ProcessedFile> => {
  try {
    const fileName = path.basename(filePath);
    const fileExt = path.extname(filePath);
    const fileNameWithoutExt = path.basename(filePath, fileExt);

    const outputFileName = `${outputFolder}/${fileNameWithoutExt}.mp4`;

    const command = ffmpeg(filePath)
      .input(watermarkPath)
      .complexFilter("[0:v][1:v]overlay=W-w-10:H-h-10");

    await command.output(outputFileName).run();

    console.log(`Video with watermark saved: ${outputFileName}`);
    return;
  } catch (error) {
    console.error("Error while adding watermark to video:", error);
    throw error;
  }
};

/** Video watermarking function */

export const addWatermarek = async (
  videoPath: string,
  outputPath: string,
  watermarkPath: string
) => {
  const command = ffmpeg(videoPath);
  const watermarkSettings = {
    file: watermarkPath,
    position: "SE",
    size: "25%",
  };

  command
    .input(watermarkPath)
    .output(outputPath)
    .on("end", () => console.log("Video processing finished"))
    .run();
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

export { processRawFileToMp4, processMp4ToHls };

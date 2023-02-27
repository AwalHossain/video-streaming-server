import { exec } from "child_process";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { promisify } from "util";
import { QUEUES_EVENTS } from "./constants";
import { addQueueItem } from "./queue";

const execAsync = promisify(exec);

interface Output {
  fileName: string;
  outputFileName: string;
}

export const processRawFiletoMp4 = async (
  filePath: string,
  outputFolder: string,
  jobData: object
): Promise<Output> => {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath);

  const fileNameWithoutExt = path.basename(filePath, fileExt);

  const outputFileName = `${outputFolder}/${fileNameWithoutExt}.mp4`;

  const command = ffmpeg(filePath)
    .output(outputFileName)
    .on("start", (commandLine: string) => {
      console.log(`Spawned Ffmpeg with command`, commandLine);
    })
    .on("progress", (progress: ffmpeg.Progress) => {
      console.log("Processing " + progress.percent + "% done");
    })
    .on("end", () => {
      console.log("Finished processing");

      addQueueItem(QUEUES_EVENTS.VIDEO_PROCESSED, { ...jobData });
    })
    .on("error", (err: Error) => {
      console.log("An error occurred", err.message);
    })
    .run();

  return {
    fileName,
    outputFileName,
  };
};

export const processMp4ToHls = async (
  filePath: string,
  outputFolder: string,
  jobData: object
): Promise<Output> => {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath);

  const fileNameWithoutExt = path.basename(filePath, fileExt);
  const outputFileName = `${outputFolder}/${fileNameWithoutExt}.m3u8`;

  const command = ffmpeg(filePath)
    .output(outputFileName)
    .outputOptions([
      "-hls_time 10",
      "-hls_list_size 0",
      "-hls_segment_filename",
      `${outputFolder}/${fileNameWithoutExt}_%03d.ts`,
    ])
    .on("start", (commandLine: string) => {
      console.log(`Spawned Ffmpeg with command`, commandLine);
    })
    .on("progress", (progress: ffmpeg.Progress) => {
      console.log("Processing " + progress.percent + "% done");
    })
    .on("end", () => {
      console.log("Finished processing");

      addQueueItem(QUEUES_EVENTS.VIDEO_HLS_CONVERTED, {
        ...jobData,
        path: outputFileName,
      });
    })
    .on("error", (err: Error) => {
      console.log("An error occurred", err.message);
    })
    .run();

  return {
    fileName,
    outputFileName,
  };
};

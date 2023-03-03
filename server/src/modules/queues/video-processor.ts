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
      console.log("Finished processing");
      addQueueItem(QUEUE_EVENTS.VIDEO_HLS_CONVERTED, {
        ...jobData,
        path: outputFileName,
      });
    })
    .on("error", function (err: Error) {
      console.log("An error occurred: " + err.message);
    })
    .run();

  return { fileName, outputFileName };
};

export { processRawFileToMp4, processMp4ToHls };

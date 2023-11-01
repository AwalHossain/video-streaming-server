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
  watermarkImageFilePath?: string | null
): Promise<WatermarkFile> => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);

  const outputFileName = `${outputFolder}/${fileNameWithoutExt}.mp4`;

  const ffmpegCommand = ffmpeg(filePath).output(outputFileName);

  console.log(watermarkImageFilePath, "watermarkImageFilePath");


  if (watermarkImageFilePath) {
    ffmpegCommand.input(watermarkImageFilePath).complexFilter([
      "[0:v]scale=640:-1[bg];" +
      "[1:v]scale=iw/6:ih/6[watermark];" +
      "[bg][watermark]overlay=W-w-10:10:enable='between(t,0,inf)'",
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

      // if (watermarkImageFilePath) {
      //   await addQueueItem(QUEUE_EVENTS.VIDEO_WATERMARKED, {
      //     ...jobData,
      //     completed: true,
      //     path: outputFileName,
      //   });
      // }
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


const generateThumbnail = async (
  filePath: string,
  outputFolder: string,
  jobData: JobData
): Promise<ProcessedFile> => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);
  const thumbnailFileName = `${fileNameWithoutExt}.png`;
  const outputFileName = `${outputFolder}/${thumbnailFileName}`;
  console.log(thumbnailFileName, 'thumbnailFileName');
  ffmpeg(filePath)
    .screenshots({
      timestamps: ['00:01'],
      filename: thumbnailFileName,
      folder: `${outputFolder}`,
      // size: "320x240",
    })
    .on('end', async function () {
      console.log("hthumnail generated!", jobData.path);
      await addQueueItem(QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED, {
        ...jobData,
        completed: true,
        path: thumbnailFileName
      });
    })
  return;

};


// / Define a function to create HLS variants for different qualitie



const processMp4ToHls = async (
  filePath: string,
  outputFolder: string,
  jobData: JobData
): Promise<ProcessedFile> => {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);
  console.log(outputFolder, 'again checking output folder');

  const renditions = [
    { resolution: '854x480', bitrate: '800k', name: '480p' },
    { resolution: '1280x720', bitrate: '2000k', name: '720p' },
  ];

  // Create renditions
  const promises = renditions.map((rendition) => {
    return new Promise<void>((resolve, reject) => {
      ffmpeg(filePath)
        .output(`${outputFolder}/${fileNameWithoutExt}_${rendition.name}.m3u8`)
        .outputOptions([
          `-vf "scale=${rendition.resolution}"`,
          `-b:v ${rendition.bitrate}`,
          '-c:v h264',
          '-g 48',
          '-hls_time 10',
          '-hls_list_size 0',
          '-hls_segment_filename',
          `${outputFolder}/${fileNameWithoutExt}_${rendition.name}_%03d.ts`,
        ])
        .on('start', function (commandLine: string) {
          console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on('progress', function (progress: any) {
          console.log(`Processing: ${progress.percent}% done for ${rendition.name}`);
        })
        .on('end', function () {
          console.log(`Finished processing ${rendition.name}`);
          resolve();
        })
        .on('error', function (err: Error) {
          console.log('An error occurred: ' + err.message);
          reject(err);
        })
        .run();
    });
  });

  // Wait for all renditions to complete
  await Promise.all(promises);


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
};



export { processMp4ToHls, processRawFileToMp4WithWatermark };


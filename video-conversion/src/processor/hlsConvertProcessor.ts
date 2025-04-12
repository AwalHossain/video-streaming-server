import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { API_GATEWAY_EVENTS, QUEUE_EVENTS } from '../constant/events';
import ApiError from '../errors/apiError';
import { addQueueItem } from '../queues/addJobToQueue';
import { errorLogger, logger } from '../shared/logger';
import RabbitMQ from '../shared/rabbitMQ';
import { FfmpegProgress } from '../types/common';
import { getVideoDurationAndResolution } from './videoProcessingHandler';

ffmpeg.setFfmpegPath(ffmpegPath);

interface ProcessedFile {
  fileName: string;
  outputFileName: string;
}

interface JobData {
  completed: boolean;
  path: string;
  destination: string;
  userId: string;
  fileName: string;
}

const processMp4ToHls = async (
  filePath: string,
  outputFolder: string,
  jobData: JobData,
): Promise<ProcessedFile> => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);
  logger.info(outputFolder, 'again checking output folder');
  
  try {
    // Get video resolution to maintain aspect ratio
    const { videoResolution } = await getVideoDurationAndResolution(filePath);
    const isVertical = videoResolution.height > videoResolution.width;
    
    // Create appropriate renditions based on original aspect ratio
    let renditions;
    
    if (isVertical) {
      // For vertical videos (like 9:16 shorts), maintain aspect ratio
      const aspectRatio = videoResolution.width / videoResolution.height;
      
      // Calculate resolutions maintaining aspect ratio
      const height480 = 480;
      const width480 = Math.round(height480 * aspectRatio);
      
      const height1080 = 1080;
      const width1080 = Math.round(height1080 * aspectRatio);
      
      renditions = [
        { resolution: `${width480}x${height480}`, bitrate: '800k', name: '480p' },
        { resolution: `${width1080}x${height1080}`, bitrate: '5000k', name: '1080p' },
      ];
      
      logger.info(`Processing vertical video with aspect ratio ${aspectRatio.toFixed(2)}. Using custom resolutions.`);
    } else {
      // Standard landscape video (16:9) uses standard resolutions
      renditions = [
        { resolution: '854x480', bitrate: '800k', name: '480p' },
        { resolution: '1920x1080', bitrate: '5000k', name: '1080p' },
      ];
    }

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
            .output(
              `${outputFolder}/${fileNameWithoutExt}_${rendition.name}.m3u8`,
            )
            .outputOptions([
              `-s ${rendition.resolution}`,
              `-c:v libx264`,
              `-crf 23`,
              `-preset fast`,
              `-b:v ${rendition.bitrate}`,
              `-g 48`,
              `-hls_time 10`,
              `-hls_playlist_type vod`,                                    // Indicate Video on Demand type (adds #EXT-X-ENDLIST)
              `-hls_flags independent_segments`,                           // Ensures each segment starts with a keyframe
              `-hls_list_size 0`,
              `-hls_segment_filename`,
              `${outputFolder}/${fileNameWithoutExt}_${rendition.name}_%03d.ts`,
            ])
            .on('start', function (commandLine: string) {
              logger.info('Spawned Ffmpeg with command: ' + commandLine);

              const initBitRateProcessingData = {
                userId: jobData.userId,
                status: 'processing',
                name: 'Adaptive bit rate',
                fileName: fileNameWithoutExt,
                progress: 1,
                message: 'Adaptive bit rate is Processing',
              };
              RabbitMQ.sendToQueue(
                API_GATEWAY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING,
                initBitRateProcessingData,
              );
            })
            .on('progress', function (progress: FfmpegProgress) {
              console.log(
                jobData.fileName,
                `is Processing: ${progress.percent}% done for ${rendition.name}`,
              );

              renditionProgress[rendition.name] = progress.percent;

              // calculate the overall progress
              const totalProgress = Object.values(renditionProgress).reduce(
                (a, b) => a + b,
                0,
              );
              const overallProgress = Math.round(
                totalProgress / renditions.length,
              );
              console.log(`Overall progress: ${overallProgress}%`);

              if (overallProgress - lastReportedProgress >= 10) {
                lastReportedProgress = overallProgress;

                const videoBitRateProcessingData = {
                  userId: jobData.userId,
                  status: 'processing',
                  name: 'Adaptive bit rate',
                  progress: lastReportedProgress,
                  fileName: fileNameWithoutExt,
                  message: 'Adaptive bit rate Processing',
                };

                RabbitMQ.sendToQueue(
                  API_GATEWAY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING,
                  videoBitRateProcessingData,
                );
              }
            })
            .on('end', function () {
              resolve();
            })
            .on('error', function (err: Error) {
              errorLogger.log('An error occurred: ', err.message);
              const videoBitRateProcessingData = {
                userId: jobData.userId,
                status: 'failed',
                name: 'Adaptive bit rate',
                progress: 0,
                fileName: fileNameWithoutExt,
                message: 'Video hls convering Processed failed',
              };

              RabbitMQ.sendToQueue(
                API_GATEWAY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING,
                videoBitRateProcessingData,
              );

              reject(err);
            })
            .run();
        });
      });

      // Wait for all renditions to complete
      await Promise.all(promises);

      const videoBitRateProcessedData = {
        userId: jobData.userId,
        status: 'completed',
        name: 'Adaptive bit rate',
        fileName: fileNameWithoutExt,
        progress: 100,
        message: 'Video hls convering Processed successfully',
      };

      RabbitMQ.sendToQueue(
        API_GATEWAY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING,
        videoBitRateProcessedData,
      );

      // io.to(jobData.userId).emit(
      //   NOTIFY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSED,
      //   {
      //     status: 'success',
      //     name: 'Adaptive bit rate',
      //     fileName: fileNameWithoutExt,
      //     message: 'Video Processed successfully',
      //   },
      // );

      const videoBitRateCompletedData = {
        userId: jobData.userId,
        status: 'success',
        name: 'Adaptive bit rate',
        fileName: fileNameWithoutExt,
        message: 'Video Processed successfully',
      };

      RabbitMQ.sendToQueue(
        API_GATEWAY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSED,
        videoBitRateCompletedData,
      );

      // Create master playlist file
      const masterPlaylistContent = `#EXTM3U
#EXT-X-VERSION:3
${renditions
  .map(
    (rendition) =>
      `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(rendition.bitrate)}000,RESOLUTION=${rendition.resolution}\n${fileNameWithoutExt}_${rendition.name}.m3u8`,
  )
  .join('\n')}
`;
      const outputFileName = `${outputFolder}/${fileNameWithoutExt}_master.m3u8`;
      fs.writeFileSync(outputFileName, masterPlaylistContent);

      addQueueItem(QUEUE_EVENTS.VIDEO_HLS_CONVERTED, {
        ...jobData,
        completed: true,
        path: outputFileName,
      });

      return;
    } catch (err) {
      errorLogger.log('An error occurredm in hls converter ', err);
      // io.to(jobData.userId).emit(
      //   NOTIFY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING,
      //   {
      //     status: 'failed',
      //     name: 'Video hls',
      //     progress: 0,
      //     fileName: fileNameWithoutExt,
      //     message: 'Video hls convering Processed failed',
      //   },
      // );

      const videoBitRateFailedData = {
        userId: jobData.userId,
        status: 'failed',
        name: 'Video hls',
        progress: 0,
        fileName: fileNameWithoutExt,
        message: 'Video hls convering Processed failed',
      };

      RabbitMQ.sendToQueue(
        API_GATEWAY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING,
        videoBitRateFailedData,
      );

      throw new ApiError(500, 'Video hls converting failed');
    }
  } catch (err) {
    errorLogger.log('An error occurred in hls converter ', err);
    // io.to(jobData.userId).emit(
    //   NOTIFY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING,
    //   {
    //     status: 'failed',
    //     name: 'Video hls',
    //     progress: 0,
    //     fileName: fileNameWithoutExt,
    //     message: 'Video hls convering Processed failed',
    //   },
    // );

    const videoBitRateFailedData = {
      userId: jobData.userId,
      status: 'failed',
      name: 'Video hls',
      progress: 0,
      fileName: fileNameWithoutExt,
      message: 'Video hls convering Processed failed',
    };

    RabbitMQ.sendToQueue(
      API_GATEWAY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING,
      videoBitRateFailedData,
    );

    throw new ApiError(500, 'Video hls converting failed');
  }
};

export default processMp4ToHls;

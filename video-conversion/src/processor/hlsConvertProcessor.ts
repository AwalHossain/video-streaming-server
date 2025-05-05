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
    // Get video resolution to handle aspect ratio correctly
    const { videoResolution } = await getVideoDurationAndResolution(filePath);
    let renditions;
    let useOriginalDimensions = false;

    // Check if we got valid dimensions
    if (!videoResolution.width || !videoResolution.height || isNaN(videoResolution.width / videoResolution.height)) {
      logger.warn(`Invalid video dimensions detected (${videoResolution.width}x${videoResolution.height}). Using original file without dimension changes.`);
      // Don't apply scaling when dimensions can't be detected
      useOriginalDimensions = true;
      renditions = [
        { resolution: 'copy', bitrate: '0', name: 'original' },
      ];
    } else {
      // Check if this is a vertical video (e.g. from mobile)
      const isVertical = videoResolution.height > videoResolution.width;

      if (isVertical) {
        // For vertical videos, calculate dimensions that preserve aspect ratio
        const aspectRatio = videoResolution.width / videoResolution.height;

        // Calculate heights first, then calculate width based on exact aspect ratio
        const height360 = 360;
        let width360 = Math.round(height360 * aspectRatio);
        // Ensure width is even (required by most codecs)
        width360 = width360 % 2 === 0 ? width360 : width360 + 1;

        const height720 = 720;
        let width720 = Math.round(height720 * aspectRatio);
        // Ensure width is even
        width720 = width720 % 2 === 0 ? width720 : width720 + 1;

        renditions = [
          { resolution: `${width360}x${height360}`, bitrate: '500k', name: '360p' },
          { resolution: `${width720}x${height720}`, bitrate: '2500k', name: '720p' },
        ];

        logger.info(`Processing vertical video with aspect ratio ${aspectRatio.toFixed(2)}. Using custom renditions.`);
      } else {
        // Standard landscape video uses standard resolutions
        renditions = [
          { resolution: '640x360', bitrate: '500k', name: '360p' },
          { resolution: '1280x720', bitrate: '2500k', name: '720p' },
        ];
      }
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
          const ffmpegCommand = ffmpeg(filePath)
            .output(
              `${outputFolder}/${fileNameWithoutExt}_${rendition.name}.m3u8`,
            );

          // Apply different options based on whether we detected dimensions
          if (useOriginalDimensions) {
            // Keep original dimensions and codec settings
            ffmpegCommand.outputOptions([
              `-c:v libx264`,
              `-crf 23`,
              `-preset fast`,
              `-g 48`,
              `-hls_time 10`,
              `-hls_list_size 0`,
              `-hls_segment_filename`,
              `${outputFolder}/${fileNameWithoutExt}_${rendition.name}_%03d.ts`,
            ]);
          } else {
            // Apply resolution, bitrate and other settings
            ffmpegCommand.outputOptions([
              `-s ${rendition.resolution}`,
              `-c:v libx264`,
              `-crf 24`,
              `-preset faster`,
              `-b:v ${rendition.bitrate}`,
              `-g 48`,
              `-hls_time 10`,
              `-hls_list_size 0`,
              `-hls_segment_filename`,
              `${outputFolder}/${fileNameWithoutExt}_${rendition.name}_%03d.ts`,
            ]);
          }

          ffmpegCommand
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

              // Store progress, ensuring it's a number (without defaulting to 0)
              renditionProgress[rendition.name] = progress.percent;

              // For undefined dimensions, use the progress value directly
              if (useOriginalDimensions) {
                // Just use whatever progress value we have, even if it's NaN
                const overallProgress = Math.round(progress.percent || 0);
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
              } else {
                // For normal videos with dimensions, calculate combined progress
                const totalProgress = Object.values(renditionProgress).reduce(
                  (a, b) => a + (isNaN(b) ? 0 : b),
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
              `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(rendition.bitrate) || 5000}000,RESOLUTION=${rendition.resolution === 'copy' ? 'auto' : rendition.resolution}\n${fileNameWithoutExt}_${rendition.name}.m3u8`,
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

import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { API_GATEWAY_EVENTS, QUEUE_EVENTS } from '../constant/events';
import ApiError from '../errors/apiError';
import { addQueueItem } from '../queues/addJobToQueue';
import { errorLogger, logger } from '../shared/logger';
import RabbitMQ from '../shared/rabbitMQ';
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
    // Get video resolution to create proportional renditions
    const { videoResolution } = await getVideoDurationAndResolution(filePath);
    const aspectRatio = videoResolution.width / videoResolution.height;

    // Check if we have valid dimensions or if we need to use fallback values
    if (!videoResolution.width || !videoResolution.height || isNaN(aspectRatio)) {
      logger.warn(`Invalid video dimensions detected (${videoResolution.width}x${videoResolution.height}). Using original video without dimension changes.`);

      try {
        // Instead of guessing dimensions, we'll use a single HLS stream and preserve the original video
        // This avoids any distortion when we can't properly detect dimensions
        let lastReportedProgress = 0;
        const trackProgressInterval = setInterval(() => {
          lastReportedProgress += 5;
          if (lastReportedProgress <= 90) {
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
        }, 2000);

        await new Promise<void>((resolve, reject) => {
          ffmpeg(filePath)
            .output(`${outputFolder}/${fileNameWithoutExt}.m3u8`)
            .outputOptions([
              // Don't specify dimensions - keep original
              `-c:v`, `libx264`,   // Video codec
              `-crf`, `23`,        // Quality
              `-preset`, `fast`,   // Encoding speed/compression tradeoff
              `-c:a`, `aac`,       // Audio codec
              `-hls_time`, `10`,
              `-hls_playlist_type`, `vod`,
              `-hls_flags`, `independent_segments`,
              `-hls_list_size`, `0`,
              `-hls_segment_filename`,
              `${outputFolder}/${fileNameWithoutExt}_%03d.ts`,
            ])
            .on('start', function (commandLine: string) {
              logger.info(`Spawned Ffmpeg fallback command: ${commandLine}`);
            })
            .on('progress', function (progress) {
              if (progress.percent) {
                // Update progress based on actual ffmpeg progress when available
                const currentProgress = Math.min(90, Math.round(progress.percent));
                if (currentProgress > lastReportedProgress) {
                  lastReportedProgress = currentProgress;
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
            .on('error', function (err: Error) {
              clearInterval(trackProgressInterval);
              logger.error(`Error processing fallback conversion: ${err.message}`);
              reject(err);
            })
            .on('end', function () {
              clearInterval(trackProgressInterval);
              logger.info(`Finished processing original-sized rendition`);
              resolve();
            })
            .run();
        });

        // Only after the conversion is complete, send the 100% notification
        const videoBitRateProcessedData = {
          userId: jobData.userId,
          status: 'completed',
          name: 'Adaptive bit rate',
          fileName: fileNameWithoutExt,
          progress: 100,
          message: 'Video HLS conversion completed successfully',
        };

        RabbitMQ.sendToQueue(
          API_GATEWAY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING,
          videoBitRateProcessedData,
        );

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

        // Create a simple master playlist for the single rendition
        // Since we don't know dimensions, we'll simply reference the one stream
        const masterPlaylistContent = `#EXTM3U
          #EXT-X-VERSION:3
          #EXT-X-STREAM-INF:BANDWIDTH=2500000
          ${fileNameWithoutExt}.m3u8
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
        errorLogger.log('An error occurred in hls converter with fallback renditions', err);
        throw err;
      }
    }

    // Calculate rendition dimensions while preserving aspect ratio exactly
    // We'll use height as the base and calculate width to maintain aspect ratio
    // Always ensure dimensions are even numbers (required by h.264)

    // 360p rendition
    const height360 = 360;
    let width360 = Math.round(height360 * aspectRatio);
    width360 = width360 % 2 === 0 ? width360 : width360 + 1;

    // 720p rendition
    const height720 = 720;
    let width720 = Math.round(height720 * aspectRatio);
    width720 = width720 % 2 === 0 ? width720 : width720 + 1;

    // Create renditions list with calculated dimensions
    const renditions = [
      { height: height360, width: width360, bitrate: '800k', name: '360p' },
      { height: height720, width: width720, bitrate: '2500k', name: '720p' }
    ];

    logger.info(`Processing video with original aspect ratio ${aspectRatio.toFixed(4)}`);
    logger.info(`Creating proportional renditions: 360p (${width360}x${height360}), 720p (${width720}x${height720})`);

    try {
      // Process each rendition while maintaining aspect ratio
      const promises = renditions.map(rendition => {
        return new Promise<void>((resolve, reject) => {
          ffmpeg(filePath)
            .output(`${outputFolder}/${fileNameWithoutExt}_${rendition.name}.m3u8`)
            .outputOptions([
              // Set exact dimensions that preserve aspect ratio
              `-vf`, `scale=${rendition.width}:${rendition.height}`,
              `-c:v`, `libx264`,
              `-crf`, `23`,
              `-preset`, `fast`,
              `-b:v`, `${rendition.bitrate}`,
              `-maxrate`, `${rendition.bitrate}`,
              `-bufsize`, `${parseInt(rendition.bitrate)}*2k`,
              `-g`, `48`,
              `-hls_time`, `10`,
              `-hls_playlist_type`, `vod`,
              `-hls_flags`, `independent_segments`,
              `-hls_list_size`, `0`,
              `-hls_segment_filename`,
              `${outputFolder}/${fileNameWithoutExt}_${rendition.name}_%03d.ts`,
            ])
            .on('start', function (commandLine: string) {
              logger.info(`Spawned Ffmpeg for ${rendition.name}: ${commandLine}`);
            })
            .on('error', function (err: Error) {
              logger.error(`Error processing ${rendition.name}: ${err.message}`);
              reject(err);
            })
            .on('end', function () {
              logger.info(`Finished processing ${rendition.name} rendition`);
              resolve();
            })
            .run();
        });
      });

      // Add progress tracking
      let lastReportedProgress = 0;
      const trackProgress = setInterval(() => {
        lastReportedProgress += 10;
        if (lastReportedProgress <= 90) {
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
      }, 5000);

      // Wait for all renditions to complete
      await Promise.all(promises);
      clearInterval(trackProgress);

      const videoBitRateProcessedData = {
        userId: jobData.userId,
        status: 'completed',
        name: 'Adaptive bit rate',
        fileName: fileNameWithoutExt,
        progress: 100,
        message: 'Video HLS conversion completed successfully',
      };

      RabbitMQ.sendToQueue(
        API_GATEWAY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING,
        videoBitRateProcessedData,
      );

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

      // Create master playlist
      const masterPlaylistContent = `#EXTM3U
#EXT-X-VERSION:3
${renditions.map(rendition =>
        `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(rendition.bitrate) * 1000},RESOLUTION=${rendition.width}x${rendition.height}
${fileNameWithoutExt}_${rendition.name}.m3u8`
      ).join('\n')}
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
      errorLogger.log('An error occurred in hls converter ', err);

      const videoBitRateFailedData = {
        userId: jobData.userId,
        status: 'failed',
        name: 'Video hls',
        progress: 0,
        fileName: fileNameWithoutExt,
        message: 'Video hls converting failed',
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
      message: 'Video hls converting failed',
    };

    RabbitMQ.sendToQueue(
      API_GATEWAY_EVENTS.NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING,
      videoBitRateFailedData,
    );

    throw new ApiError(500, 'Video hls converting failed');
  }
};

export default processMp4ToHls;

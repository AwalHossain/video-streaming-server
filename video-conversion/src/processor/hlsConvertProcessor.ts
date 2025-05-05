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
    // Get video resolution but don't change it
    const { videoResolution } = await getVideoDurationAndResolution(filePath);
    logger.info(`Processing video with ORIGINAL dimensions: ${videoResolution.width}x${videoResolution.height}`);

    let lastReportedProgress = 0;
    try {
      // Create a single HLS stream with original dimensions
      await new Promise<void>((resolve, reject) => {
        ffmpeg(filePath)
          .output(`${outputFolder}/${fileNameWithoutExt}.m3u8`)
          .outputOptions([
            // No scaling or dimension changes - keep original
            `-c:v`, `libx264`,
            `-crf`, `23`,
            `-preset`, `fast`,
            // Use variable bitrate based on video size
            `-b:v`, `2500k`,
            `-g`, `48`,
            `-hls_time`, `10`,
            `-hls_playlist_type`, `vod`,
            `-hls_flags`, `independent_segments`,
            `-hls_list_size`, `0`,
            `-hls_segment_filename`,
            `${outputFolder}/${fileNameWithoutExt}_%03d.ts`,
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
              `is Processing: ${progress.percent}% done`,
            );

            if (progress.percent - lastReportedProgress >= 10) {
              lastReportedProgress = progress.percent;

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

      // Create a simple master playlist that just references the one rendition
      const masterPlaylistContent = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=${videoResolution.width}x${videoResolution.height}
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
      errorLogger.log('An error occurredm in hls converter ', err);

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

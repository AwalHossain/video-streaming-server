/* eslint-disable @typescript-eslint/no-explicit-any */
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { errorLogger, logger } from '../shared/logger';

ffmpeg.setFfmpegPath(ffmpegPath);

// / Define a function to create HLS variants for different qualitie

function formatDuration(durationInSeconds: number): string {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds - hours * 3600) / 60);
  const seconds = Math.floor(durationInSeconds - hours * 3600 - minutes * 60);

  let result = '';
  if (hours > 0) {
    result += hours.toString().padStart(2, '0') + ':';
  }

  result += minutes.toString().padStart(2, '0') + ':';
  result += seconds.toString().padStart(2, '0');

  return result;
}

// get video duration & resolution

export const getVideoDurationAndResolution = async (
  filePath: string,
): Promise<{
  videoDuration: string;
  videoResolution: { width: number; height: number };
}> => {
  return new Promise((resolve, reject) => {
    let videoDuration = '0';
    const videoResolution = {
      width: 0,
      height: 0,
    };

    ffmpeg.ffprobe(filePath, (err: Error, metadata: any) => {
      if (err || !metadata) {
        errorLogger.log('An error occurred in ffprobe ', err);
        reject(err);
      } else {
        logger.info('videoDuration format', metadata.format);
        videoDuration = formatDuration(parseInt(metadata.format.duration));
        videoResolution.width = metadata.streams[0].width;
        videoResolution.height = metadata.streams[0].height;
        resolve({ videoDuration, videoResolution });
        return;
      }
    });
  });
};

export const getImageAspectRatio = async (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err: any, metadata: any) => {
      if (err) {
        errorLogger.log('An error occurred in AspectRatio ', err);
        reject(err);
      }
      const imageAspectRatio = metadata.streams[0].display_aspect_ratio;
      resolve(imageAspectRatio);
      return;
    });
  });
};

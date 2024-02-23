/* eslint-disable prefer-const */
import { Request, Response } from 'express';
import { NOTIFY_EVENTS, QUEUE_EVENTS } from '../../../constant/queueEvents';
import catchAsync from '../../../errors/catchAsyncError';
import { getVideoDurationAndResolution } from '../../../handler/videoProcessingHandler';
import { addQueueItem } from '../../../queues/addJobToQueue';
import { io } from '../../../server';
import { RedisClient } from '../../../shared/redis';
import { EVENT } from '../../events/event.constant';

const uploadVideo = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  console.log('checking userId', userId);
  {
    if (!req.files['video']) {
      io.to(userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_UPLOADED, {
        status: 'failed',
        message: 'Video upload is failed',
      });
      res
        .status(400)
        .json({ status: 'failed', message: 'Video file is required' });
      return;
    }

    const videoMetadata = req.body.videoMetadata;

    console.log('videoMetadata checking here', videoMetadata);

    io.to(userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_UPLOADED, {
      status: 'success',
      message: 'Video upload is success',
    });

    const video = req.files['video'][0];

    let image = null;
    if (req.files['image']) {
      image = req.files['image'][0];
    }

    const { videoDuration } = await getVideoDurationAndResolution(video.path);

    let payload = {
      fileName: video.filename,
      videoPath: video.path,
      watermarkPath: image?.path ?? null,
      title: videoMetadata.originalName,
      duration: videoDuration,
    };

    // const result = await VideoService.updateHistory(videoMetadata._id, {
    //   history: { status: QUEUE_EVENTS.VIDEO_UPLOADED, createdAt: Date.now() },
    //   ...payload,
    // },);

    const sendData = {
      id: videoMetadata._id,
      history: { status: QUEUE_EVENTS.VIDEO_UPLOADED, createdAt: Date.now() },
      ...payload,
    };

    RedisClient.publish(
      EVENT.UPDATA_VIDEO_METADATA_EVENT,
      JSON.stringify(sendData),
    );

    io.to(userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_METADATA_SAVED, {
      status: 'success',
      name: 'Video metadata saving',
      message: 'Video metadata saved',
    });

    await addQueueItem(QUEUE_EVENTS.VIDEO_UPLOADED, {
      userId,
      id: videoMetadata._id,
      ...payload,
      ...video,
    });

    res.status(200).json({
      status: 'success',
      message: 'Upload success',
      data: {
        ...payload,
        ...req.file,
      },
    });
  }
});

export const videoController = {
  uploadVideo,
};

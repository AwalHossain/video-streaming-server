/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { Request, Response } from 'express';

import { API_GATEWAY_EVENTS, QUEUE_EVENTS } from '../../../constant/events';
import catchAsync from '../../../errors/catchAsyncError';
import { getVideoDurationAndResolution } from '../../../processor/videoProcessingHandler';
import { addQueueItem } from '../../../queues/addJobToQueue';
import { io } from '../../../server';
import eventManager from '../../../shared/event-manager';
import RabbitMQ from '../../../shared/rabbitMQ';

const uploadVideo = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  console.log('checking userId', userId);
  {
    if (!req.files['video']) {
      io.to(userId).emit(API_GATEWAY_EVENTS.NOTIFY_VIDEO_UPLOADED, {
        status: 'failed',
        message: 'Video upload is failed',
      });
      res
        .status(400)
        .json({ status: 'failed', message: 'Video file is required' });
      return;
    }
    const video = req.files['video'][0];

    // Call the videoQueue function
    let videoMetadata;
    const handleVideoMetadata = async (data) => {
      console.log('videoMetadata checking here', data);
      videoMetadata = data;
      // Rest of your code that depends on videoMetadata...
    };
    eventManager.on('messageReceived', handleVideoMetadata);

    console.log('videoMetadata checking here', videoMetadata);

    // io.to(userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_UPLOADED, {
    //   status: 'success',
    //   message: 'Video upload is success',
    // });
    const uploadMsg = {
      userId,
      status: 'success',
      message: 'Video upload is success',
    };

    RabbitMQ.sendToQueue(API_GATEWAY_EVENTS.NOTIFY_VIDEO_UPLOADED, uploadMsg);

    let image = null;
    if (req.files['image']) {
      image = req.files['image'][0];
    }

    const { videoDuration } = await getVideoDurationAndResolution(video.path);

    let payload = {
      fileName: video.filename,
      videoPath: video.path,
      watermarkPath: image?.path ?? null,
      title: videoMetadata?.originalName,
      duration: videoDuration,
    };

    // const result = await VideoService.updateHistory(videoMetadata._id, {
    //   history: { status: QUEUE_EVENTS.VIDEO_UPLOADED, createdAt: Date.now() },
    //   ...payload,
    // },);

    const updateMetadata = {
      id: videoMetadata?._id,
      history: { status: QUEUE_EVENTS.VIDEO_UPLOADED, createdAt: Date.now() },
      ...payload,
    };

    // RedisClient.publish(
    //   EVENT.UPDATA_VIDEO_METADATA_EVENT,
    //   JSON.stringify(sendData),
    // );

    // RabbitMQ.sendToQueue(
    //   API_SERVER_EVENTS.INSERT_VIDEO_METADATA_EVENT,
    //   updateMetadata,
    // );

    // io.to(userId).emit(API_GATEWAY_EVENTS.NOTIFY_VIDEO_METADATA_SAVED, {
    //   status: 'success',
    //   name: 'Video metadata saving',
    //   message: 'Video metadata saved',
    // });
    const metadataMsg = {
      userId,
      status: 'success',
      name: 'Video metadata saving',
      message: 'Video metadata saved',
    };
    RabbitMQ.sendToQueue(
      API_GATEWAY_EVENTS.NOTIFY_VIDEO_METADATA_SAVED,
      metadataMsg,
    );

    await addQueueItem(QUEUE_EVENTS.VIDEO_UPLOADED, {
      userId,
      id: videoMetadata?._id,
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

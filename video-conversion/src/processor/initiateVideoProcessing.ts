/* eslint-disable @typescript-eslint/no-explicit-any */
// intiaate video Processing

import { API_GATEWAY_EVENTS, QUEUE_EVENTS } from '../constant/events';
import { addQueueItem } from '../queues/addJobToQueue';
import RabbitMQ from '../shared/rabbitMQ';

type VideoPath = {
  videoPath: string;
  destination: string;
  userId: string;
  videoMetadata: any;
};

const initiateVideoProcessing = async ({
  videoPath,
  destination,
  userId,
  videoMetadata,
}: VideoPath) => {
  // update status to download complete

  const uploadMsg = {
    userId,
    status: 'success',
    message: 'Video upload is success',
  };

  console.log('uploadMsg', uploadMsg);

  //   passing an event to the client to make sure video sucessfully uploaded & downloaded & ready to process
  RabbitMQ.sendToQueue(API_GATEWAY_EVENTS.NOTIFY_VIDEO_UPLOADED, uploadMsg);

  // store download status in the database
  //   RabbitMQ.sendToQueue(API_SERVER_EVENTS.)

  // const { videoDuration } = await getVideoDurationAndResolution(video.path);

  // let payload = {
  //   fileName: video.filename,
  //   videoPath: video.path,
  //   watermarkPath: image?.path ?? null,
  //   title: videoMetadata?.originalName,
  //   duration: videoDuration,
  // };
  const folder = destination.split('/')[1];
  const payload = {
    ...videoMetadata,
    id: videoMetadata._id,
    path: videoPath,
    folder,
    destination,
  };

  await addQueueItem(QUEUE_EVENTS.VIDEO_UPLOADED, {
    userId,
    id: videoMetadata?._id,
    ...payload,
  });
};

export default initiateVideoProcessing;

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-escape */
import { Request } from 'express';
import fs from 'fs';
import multer from 'multer';
import { logger } from '../../shared/logger';

let globalName = '';
const storageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadFolder = '';

    globalName = sanitizeFileName(
      file.originalname.split('.')[0].replace(/\s+/g, '_') + '_' + Date.now(),
    );
    if (!uploadFolder) {
      uploadFolder = `container-${new Date().getTime()}`;
    }
    const uploadPath = `uploads/${uploadFolder}/videos`;
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const isImage =
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg';

    if (isImage) {
      cb(null, globalName + '.png');
    } else {
      cb(null, globalName);
    }
  },
});

function sanitizeFileName(blobName: string): string {
  return blobName.replace(/[\(\)]/g, '_');
}

const fileFilter = async (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const userId = req.user.id;
  logger.info(userId, 'checking user id');
  try {
    if (
      file.mimetype === 'video/mp4' ||
      file.mimetype === 'video/x-matroska' ||
      file.mimetype === 'video/avi' ||
      file.mimetype === 'video/webm'
    ) {
      // const payload = {
      //   originalName: path.basename(
      //     file.originalname,
      //     path.extname(file.originalname),
      //   ),
      //   recordingDate: Date.now(),
      //   duration: '0:00',
      //   visibility: 'Public',
      //   author: userId,
      //   title: file.originalname.split('.')[0].replace(/[_]/g, ' '),
      // };
      // // publishing video metadata to api-server
      // // await RedisClient.publish(
      // //   EVENT.INSERT_VIDEO_METADATA_EVENT,
      // //   JSON.stringify(payload),
      // // );

      // // send the video metadata to the user queue

      // const options = {
      //   correlationId: 'correal',
      //   replyTo: EVENT.GET_VIDEO_METADATA_EVENT,
      // };
      // // Send the message
      // RabbitMQ.sendToQueue(EVENT.INSERT_VIDEO_METADATA_EVENT, payload, options);

      // // Create a promise that will be resolved when the response is received
      // const responsePromise = new Promise((resolve, reject) => {
      //   RabbitMQ.consume(
      //     EVENT.GET_VIDEO_METADATA_EVENT,
      //     async (msg: Message, ack: () => void) => {
      //       try {
      //         // check if correlationId is the same as the one sent
      //         console.log('correlationId', msg);
      //         if (msg.properties.correlationId === options.correlationId) {
      //           const data = JSON.parse(msg.content.toString());
      //           console.log('data', data);
      //           logger.info(data, 'data from event manager');

      //           ack();

      //           // Resolve the promise with the received data
      //           resolve(data);
      //         }
      //       } catch (err) {
      //         console.error('Message processing error', err);

      //         // Reject the promise if there's an error
      //         reject(err);
      //       }
      //     },
      //   );
      // });

      // // Wait for the response
      // const videoMetadata = await responsePromise;
      // // const videoMetadata: any = await new Promise((resolve) => {
      // //   EventEmitter.once('videoMetadata', (data) => {
      // //     console.log(data, 'data from event manager');
      // //     resolve(data);
      // //   });
      // // });

      // // redisClient.publish(NOTIFY_EVENTS.NOTIFY_VIDEO_INITIAL_DB_INFO, JSON.stringify(payload));
      // logger.info('videoMetadata', videoMetadata, 'userid');
      // io.to(userId).emit(
      //   'message',
      //   'This is such a bullishit, cause i am sendign the meesage to different user!',
      // );

      // io.to(userId).emit(NOTIFY_EVENTS.NOTIFY_VIDEO_INITIAL_DB_INFO, {
      //   name: 'notify_video_metadata_saved',
      //   status: 'success',
      //   message: 'Video metadata saved',
      //   data: payload,
      // });

      // req.body.videoMetadata = payload; // videoMetadata;
      cb(null, true);
    } else if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    }
  } catch (error) {
    console.log(error, 'error in fileFilter');
    cb(error, false);
  }
};

export const uploadMiddleware = multer({
  storage: storageEngine,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 50,
  },
});

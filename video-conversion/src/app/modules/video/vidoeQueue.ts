/* eslint-disable @typescript-eslint/no-explicit-any */
import { Message } from 'amqplib';
import path from 'path';
import { logger } from '../../../shared/logger';
import RabbitMQ from '../../../shared/rabbitMQ';
import { EVENT } from '../../events/event.constant';

export const videoQueue = (file: any, userId: any) => {
  return new Promise((resolve, reject) => {
    try {
      logger.info(userId, 'checking from queue');

      if (
        file.mimetype === 'video/mp4' ||
        file.mimetype === 'video/x-matroska' ||
        file.mimetype === 'video/avi' ||
        file.mimetype === 'video/webm'
      ) {
        const payload = {
          originalName: path.basename(
            file.originalname,
            path.extname(file.originalname),
          ),
          recordingDate: Date.now(),
          duration: '0:00',
          visibility: 'Public',
          author: userId,
          title: file.originalname.split('.')[0].replace(/[_]/g, ' '),
        };

        const options = {
          correlationId: 'correal',
          replyTo: EVENT.GET_VIDEO_METADATA_EVENT,
        };

        RabbitMQ.sendToQueue(
          EVENT.INSERT_VIDEO_METADATA_EVENT,
          payload,
          options,
        );

        RabbitMQ.consume(
          EVENT.GET_VIDEO_METADATA_EVENT,
          async (msg: Message, ack: () => void) => {
            try {
              if (msg.properties.correlationId === options.correlationId) {
                const data = JSON.parse(msg.content.toString());
                ack();
                resolve(data);
              }
            } catch (err) {
              reject(err);
            }
          },
        );
      } else {
        reject(new Error('Invalid file type'));
      }
    } catch (error) {
      reject(error);
    }
  });
};

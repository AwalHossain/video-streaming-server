import { Message } from 'amqplib';
import { VIDEO_CONVERSION_SERVER } from '../../../constant/events';
import downloadBlob from '../../../processor/downloadFile';
import RabbitMQ from '../../../shared/rabbitMQ';

const initVideoEvent = () => {
  // event from the api-gateway
  RabbitMQ.consume(
    VIDEO_CONVERSION_SERVER.SEND_VIDEO_METADATA_EVENT,
    async (msg: Message, ack: () => void) => {
      try {
        const data = JSON.parse(msg.content.toString());
        console.log('Received data from api-gateway:', JSON.stringify(data));

        const { bucketName, fileKey, fileName, userId } = data;
        
        if (!bucketName || !fileKey || !fileName || !userId) {
          console.error('Missing required parameters for download', data);
          ack(); // Acknowledge even on error to prevent queue blockage
          return;
        }
        
        // Digital Ocean Spaces download
        await downloadBlob(bucketName, fileKey, fileName, userId);
        ack();
      } catch (err) {
        console.error('Error in video event handler:', err);
        ack(); // Acknowledge even on error to prevent queue blockage
      }
    },
  );
};

export default initVideoEvent;
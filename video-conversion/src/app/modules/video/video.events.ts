import { Message } from 'amqplib';
import { VIDEO_CONVERSION_SERVER } from '../../../constant/events';
import downloadBlob from '../../../processor/downloadFile';
import RabbitMQ from '../../../shared/rabbitMQ';

const initVideoEvent = () => {
  // event form the api-gateway
  RabbitMQ.consume(
    VIDEO_CONVERSION_SERVER.SEND_VIDEO_METADATA_EVENT,
    async (msg: Message, ack: () => void) => {
      try {
        const data = JSON.parse(msg.content.toString());
        console.log(data, 'get data from api-gateway');

        const { containerName, fileName, userId } = data;
        // Emit the 'messageReceived' event
        await downloadBlob(containerName, fileName, userId);
        ack();
      } catch (err) {
        console.error(err);
      }
    },
  );
};

export default initVideoEvent;

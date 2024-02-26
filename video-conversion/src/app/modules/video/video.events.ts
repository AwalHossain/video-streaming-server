const initVideoEvent = () => {
  // const options = {
  //   correlationId: 'correal',
  //   replyTo: EVENT.GET_VIDEO_METADATA_EVENT,
  // };
  // RabbitMQ.consume(
  //   EVENT.GET_VIDEO_METADATA_EVENT,
  //   async (msg: Message, ack: () => void) => {
  //     try {
  //       // check if correlationId is the same as the one sent
  //       console.log('correlationId', msg);
  //       if (msg.properties.correlationId === options.correlationId) {
  //         const data = JSON.parse(msg.content.toString());
  //         console.log('data', data);
  //         logger.info(data, 'data from event manager');
  //         // EventEmitter.emit('videoMetadata', data);
  //         ack();
  //       }
  //     } catch (err) {
  //       console.error('Message processing error', err);
  //     }
  //   },
  // );
};

export default initVideoEvent;

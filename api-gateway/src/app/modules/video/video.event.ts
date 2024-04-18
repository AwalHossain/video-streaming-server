import RabbitMQ from '../../../shared/rabbitMQ';

const broadcastVideoEvent = async (
  eventName: string,
  payload: Record<string, unknown>,
) => {
  RabbitMQ.sendToQueue(eventName, payload);
};

export default broadcastVideoEvent;

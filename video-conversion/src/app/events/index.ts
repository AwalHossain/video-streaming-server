import initVideoEvent from '../modules/video/video.events';

const subscribeToEvents = () => {
  console.log('subscribing to events');
  initVideoEvent();
};

export default subscribeToEvents;

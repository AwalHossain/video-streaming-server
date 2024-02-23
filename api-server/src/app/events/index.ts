import initVideoEvents from "../modules/video/video.events";

const subscribeToEvents = () => {
  console.log("subscribing to events");

  initVideoEvents();
};

export default subscribeToEvents;

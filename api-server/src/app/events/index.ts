import initVideoEvents from "../../modules/models/video/video.events";



const subscribeToEvents = async()=>{
    console.log('subscribing to events');

    initVideoEvents();
    
}
    
    export default subscribeToEvents;
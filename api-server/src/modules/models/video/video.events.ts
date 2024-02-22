/* eslint-disable @typescript-eslint/no-unused-vars */
import { RedisClient } from "../../../shared/redis";



const initVideoEvents = () => {

    RedisClient.subscribe('video-conversion',async (e:string)=>{
        const data = JSON.parse(e);
        console.log('Video Conversion Event', data);
        
    });
}

export default initVideoEvents;

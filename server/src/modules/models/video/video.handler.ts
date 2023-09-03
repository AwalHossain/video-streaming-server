

/// here i am going to update the vidoe history and add the path after each processing

import eventManager from "../../../event-manager";
import { QUEUE_EVENTS } from "../../queues/constants";
import { VIDEO_STATUS } from "./video.constant";
import { VideoService } from "./video.service";

const setupVideoHandler =  () => {
    Object.values(QUEUE_EVENTS).forEach((queueName) => {

        eventManager.on(queueName, async(data) => {


            if(queueName === QUEUE_EVENTS.VIDEO_PROCESSED) {
                await VideoService.updateHistory(data.id, {
                    history: {status: 'processed',createdAt: Date.now()},
                    processedPath: data.path
                });
            }

            if(queueName === QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED) {
                await VideoService.updateHistory(data.id, {
                    history: {status: 'thumbnail_generated', createdAt: Date.now()},
                    thumbnailPath: data.path
                });
            }

            if(queueName === QUEUE_EVENTS.VIDEO_HLS_CONVERTED) {
                await VideoService.updateHistory(data.id, {
                    history: {status: 'hls_converted', createdAt: Date.now()},
                    hlsPath: data.path
                });
            }

            await VideoService.update(data.id, {
                status: VIDEO_STATUS.PUBLISHED
            })

            await VideoService.updateHistory(data.id, {
                history: {status: queueName, createdAt: Date.now()},
            });

            // if(queueName === QUEUE_EVENTS.VIDEO_UPLOAD_PROGRESS) {

        })  
    })
}
export default setupVideoHandler;
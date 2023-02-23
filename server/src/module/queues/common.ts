/** queue names: 
video.uploaded
video.processing
video.processed
video.hls-converting
video.hls.converted
video.watermarking
video.watermarked
*/

export const QUEUES_EVENTS = {
    VIDEO_UPLOADED: "video.uploaded",
    VIDEO_PROCESSING: "video.processing",
    VIDEO_PROCESSED: "video.processed",
    VIDEO_HLS_CONVERTING: "video.hls-converting",
    VIDEO_HLS_CONVERTED: "video.hls.converted",
    VIDEO_WATERMARKING: "video.watermarking",
    VIDEO_WATERMARKED: "video.watermarked",
  };

  /** Each of the queue will have different queue handler function */


   const uploadedHandler = async (job:any) => {
    console.log("I am uploaded handler", job.data);
    
    return {...job.data, completed: true};
  }

  const processingHandler = async (job:any) => {
    console.log("I am the Video processing handler", job.data);
    
    return {...job.data, completed: true};
    
  }

  const processedHandler = async (job:any) => {
    console.log("i am Video processed handler", job.data);

    return {...job.data, completed: true};
  }

  const hlsConvertingHandler = async (job:any) => {
    console.log("i am Video hls converting handler", job.data);

    return {...job.data, completed: true};
  }

  const hlsConvertedHandler = async (job:any) => {
    console.log("i am Video hls converted handler", job.data);

    return {...job.data, completed: true};
  }

  const watermarkingHandler = async (job:any) => {
    console.log("i am Video watermarking handler", job.data);

    return {...job.data, completed: true};
  }

  const watermarkedHandler = async (job:any) => {
    console.log("i am Video watermarked handler", job.data);

    return {...job.data, completed: true};
  }




  /** Each of the queue will be associated with the handler and create an object */

  export const QUEUE_EVENT_HANDLERS = {
    [QUEUES_EVENTS.VIDEO_UPLOADED]: uploadedHandler,
    [QUEUES_EVENTS.VIDEO_PROCESSING]: processingHandler,
    [QUEUES_EVENTS.VIDEO_PROCESSED]: processedHandler,
    [QUEUES_EVENTS.VIDEO_HLS_CONVERTING]: hlsConvertingHandler,
    [QUEUES_EVENTS.VIDEO_HLS_CONVERTED]: hlsConvertedHandler,
    [QUEUES_EVENTS.VIDEO_WATERMARKING]: watermarkingHandler,
    [QUEUES_EVENTS.VIDEO_WATERMARKED]: watermarkedHandler,
  };


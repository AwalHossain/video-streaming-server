export const VIDEO_QUEUE_EVENTS = {
  VIDEO_UPLOADED: "video.uploaded",
  VIDEO_PROCESSING: "video.processing",
  VIDEO_PROCESSED: "video.processed",
  VIDEO_HLS_CONVERTING: "video.hls-converting",
  VIDEO_HLS_CONVERTED: "video.hls.converted",
  VIDEO_WATERMARKING: "video.watermarking",
  VIDEO_WATERMARKED: "video.watermarked",
};

export const QUEUE_EVENTS = VIDEO_QUEUE_EVENTS;

export const NOTIFY_EVENTS = {
  NOTIFY_VIDEO_HLS_CONVERTED: "notify.video.hls.converted",
};

export const ALL_EVENTS = {
  ...QUEUE_EVENTS,
  ...NOTIFY_EVENTS,
};

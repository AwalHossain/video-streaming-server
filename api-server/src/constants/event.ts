export const API_SERVER_EVENTS = {
  INSERT_VIDEO_METADATA_EVENT: "insert-video-metadata",
  GET_VIDEO_METADATA_EVENT: "get-video-metadata",
  VIDEO_PROCESSED_EVENT: "video-processed",
  VIDEO_HLS_CONVERTED_EVENT: "video-hls-converted",
  VIDEO_PUBLISHED_EVENT: "video-published",
  VIDEO_THUMBNAIL_GENERATED_EVENT: "video-thumbnail-generated",
  UPDATE_METADATA_EVENT: "update-metadata",
};

export const VIDEO_CONVERSION_SERVER = {
  SEND_VIDEO_METADATA_EVENT: "send-video-metadata",
  VIDEO_CONVERTED_EVENT: "video-converted",
  VIDEO_THUMBNAIL_GENERATED_EVENT: "video-thumbnail-generated",
};


export const API_GATEWAY_EVENTS = {
  NOTIFY_VIDEO_METADATA_SAVED: 'notify.video.metadata.saved',
};
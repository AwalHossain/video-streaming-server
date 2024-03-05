export const QUEUE_EVENTS = {
  VIDEO_UPLOADED: 'video.uploaded',
  VIDEO_PROCESSING: 'video.processing',
  VIDEO_PROCESSED: 'video.processed',
  VIDEO_THUMBNAIL_GENERATED: 'video.thumbnail-generated',
  VIDEO_HLS_CONVERTING: 'video.hls-converting',
  VIDEO_HLS_CONVERTED: 'video.hls.converted',
  VIDEO_WATERMARKING: 'video.watermarking',
  VIDEO_WATERMARKED: 'video.watermarked',
};

export const API_SERVER_EVENTS = {
  INSERT_VIDEO_METADATA_EVENT: 'insert-video-metadata',
  GET_VIDEO_METADATA_EVENT: 'get-video-metadata',
  VIDEO_PROCESSED_EVENT: 'video-processed',
  VIDEO_HLS_CONVERTED_EVENT: 'video-hls-converted',
  VIDEO_PUBLISHED_EVENT: 'video-published',
  VIDEO_THUMBNAIL_GENERATED_EVENT: 'video-thumbnail-generated',
  UPDATE_METADATA_EVENT: 'update-metadata',
};

export const VIDEO_CONVERSION_SERVER = {
  SEND_VIDEO_METADATA_EVENT: 'send-video-metadata',
};

export const API_GATEWAY_EVENTS = {
  NOTIFY_VIDEO_HLS_CONVERTED: 'notify.video.hls.converted',
  NOTIFY_VIDEO_WATERMARKED: 'notify.video.watermarked',
  NOTIFY_UPLOAD_PROGRESS: 'notify.upload.progress',
  NOTIFY_VIDEO_UPLOADED: 'notify.video.uploaded',
  NOTIFY_VIDEO_PROCESSING: 'notify.video.processing',
  NOTIFY_VIDEO_PROCESSED: 'notify.video.processed',
  NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSED: 'notify.video.bit-rate.processed',
  NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING: 'notify.video.bit-rate.processing',
  NOTIFY_VIDEO_THUMBNAIL_GENERATED: 'notify.video.thumbnail-generated',
  NOTIFY_VIDEO_METADATA_SAVED: 'notify.video.metadata.saved',
  NOTIFY_EVENTS_FAILED: 'notify.failed',
  NOTIFY_AWS_S3_UPLOAD_FAILED: 'notify.aws.s3.upload.failed',
  NOTIFY_AWS_S3_UPLOAD_PROGRESS: 'notify.aws.s3.upload.progress',
  NOTIFY_AWS_S3_UPLOAD_COMPLETED: 'notify.aws.s3.upload.completed',
  NOTIFY_VIDEO_PUBLISHED: 'notify.video.published',
  NOTIFY_VIDEO_INITIAL_DB_INFO: 'notify.video.initial.db.info',
};

export const NOTIFY_EVENTS = {
  NOTIFY_VIDEO_HLS_CONVERTED: 'notify.video.hls.converted',
  NOTIFY_VIDEO_WATERMARKED: 'notify.video.watermarked',
  NOTIFY_UPLOAD_PROGRESS: 'notify.upload.progress',
  NOTIFY_VIDEO_UPLOADED: 'notify.video.uploaded',
  NOTIFY_VIDEO_PROCESSING: 'notify.video.processing',
  NOTIFY_VIDEO_PROCESSED: 'notify.video.processed',
  NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSED: 'notify.video.bit-rate.processed',
  NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING: 'notify.video.bit-rate.processing',
  NOTIFY_VIDEO_THUMBNAIL_GENERATED: 'notify.video.thumbnail-generated',
  NOTIFY_VIDEO_METADATA_SAVED: 'notify.video.metadata.saved',
  NOTIFY_EVENTS_FAILED: 'notify.failed',
  NOTIFY_AWS_S3_UPLOAD_FAILED: 'notify.aws.s3.upload.failed',
  NOTIFY_AWS_S3_UPLOAD_PROGRESS: 'notify.aws.s3.upload.progress',
  NOTIFY_AWS_S3_UPLOAD_COMPLETED: 'notify.aws.s3.upload.completed',
  NOTIFY_VIDEO_PUBLISHED: 'notify.video.published',
  NOTIFY_VIDEO_INITIAL_DB_INFO: 'notify.video.initial.db.info',
};

export const ALL_EVENTS = {
  ...QUEUE_EVENTS,
  ...API_GATEWAY_EVENTS,
};

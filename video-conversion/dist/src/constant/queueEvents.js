"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_EVENTS = exports.NOTIFY_EVENTS = exports.QUEUE_EVENTS = void 0;
exports.QUEUE_EVENTS = {
    VIDEO_UPLOADED: "video.uploaded",
    VIDEO_PROCESSING: "video.processing",
    VIDEO_PROCESSED: "video.processed",
    VIDEO_THUMBNAIL_GENERATED: "video.thumbnail-generated",
    VIDEO_HLS_CONVERTING: "video.hls-converting",
    VIDEO_HLS_CONVERTED: "video.hls.converted",
    VIDEO_WATERMARKING: "video.watermarking",
    VIDEO_WATERMARKED: "video.watermarked",
};
exports.NOTIFY_EVENTS = {
    NOTIFY_VIDEO_HLS_CONVERTED: "notify.video.hls.converted",
    NOTIFY_VIDEO_WATERMARKED: "notify.video.watermarked",
    NOTIFY_UPLOAD_PROGRESS: "notify.upload.progress",
    NOTIFY_VIDEO_UPLOADED: "notify.video.uploaded",
    NOTIFY_VIDEO_PROCESSING: "notify.video.processing",
    NOTIFY_VIDEO_PROCESSED: "notify.video.processed",
    NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSED: "notify.video.bit-rate.processed",
    NOTIFY_EVENTS_VIDEO_BIT_RATE_PROCESSING: "notify.video.bit-rate.processing",
    NOTIFY_VIDEO_THUMBNAIL_GENERATED: "notify.video.thumbnail-generated",
    NOTIFY_VIDEO_METADATA_SAVED: "notify.video.metadata.saved",
    NOTIFY_EVENTS_FAILED: "notify.failed",
    NOTIFY_AWS_S3_UPLOAD_FAILED: "notify.aws.s3.upload.failed",
    NOTIFY_AWS_S3_UPLOAD_PROGRESS: "notify.aws.s3.upload.progress",
    NOTIFY_AWS_S3_UPLOAD_COMPLETED: "notify.aws.s3.upload.completed",
    NOTIFY_VIDEO_PUBLISHED: "notify.video.published",
    NOTIFY_VIDEO_INITIAL_DB_INFO: "notify.video.initial.db.info",
};
exports.ALL_EVENTS = {
    ...exports.QUEUE_EVENTS,
    ...exports.NOTIFY_EVENTS,
};

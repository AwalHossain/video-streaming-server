"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoSearchableFields = exports.videoFilterableFields = exports.VIDEO_STATUS = exports.VIDEO_VISIBILITIES = void 0;
exports.VIDEO_VISIBILITIES = {
    PUBLIC: 'Public',
    PRIVATE: 'Private',
    UNLISTED: 'Unlisted',
};
exports.VIDEO_STATUS = {
    PENDING: "pending",
    PROCESSED: "processed",
    PUBLISHED: "published"
};
exports.videoFilterableFields = [
    "searchTerm",
    "title",
    "category",
    "recordingDate",
    "tags",
];
exports.videoSearchableFields = [
    "title",
    "category",
];

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const fileFilter = async (req, file, cb) => {
    try {
        if (file.mimetype === 'video/mp4' ||
            file.mimetype === 'video/x-matroska' ||
            file.mimetype === 'video/avi' ||
            file.mimetype === 'video/webm') {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    }
    catch (error) {
        console.log(error, 'error in fileFilter');
        cb(error, false);
    }
};
exports.uploadMiddleware = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 50,
    },
});
//# sourceMappingURL=uploadMiddleware.js.map
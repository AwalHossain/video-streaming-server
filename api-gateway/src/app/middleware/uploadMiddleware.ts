/* eslint-disable no-useless-escape */
import { Request } from 'express';
import multer from 'multer';

const fileFilter = async (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  try {
    if (
      file.mimetype === 'video/mp4' ||
      file.mimetype === 'video/x-matroska' ||
      file.mimetype === 'video/avi' ||
      file.mimetype === 'video/webm'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  } catch (error) {
    console.log(error, 'error in fileFilter');
    cb(error, false);
  }
};

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 50,
  },
});

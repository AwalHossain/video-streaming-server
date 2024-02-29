/* eslint-disable no-useless-escape */
import { Request } from 'express';
import fs from 'fs';
import multer from 'multer';

let globalName = '';
const storageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadFolder = '';

    globalName = sanitizeFileName(
      file.originalname.split('.')[0].replace(/\s+/g, '_') + '_' + Date.now(),
    );
    if (!uploadFolder) {
      uploadFolder = `container-${new Date().getTime()}`;
    }
    const uploadPath = `uploads/${uploadFolder}/videos`;
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const isImage =
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg';

    if (isImage) {
      cb(null, globalName + '.png');
    } else {
      cb(null, globalName);
    }
  },
});

function sanitizeFileName(blobName: string): string {
  return blobName.replace(/[\(\)]/g, '_');
}

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
  storage: storageEngine,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 50,
  },
});

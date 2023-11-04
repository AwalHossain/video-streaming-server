import { Request } from 'express';
import fs from "fs";
import multer from "multer";




let globalName = "";
const storageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadFolder = "";

    globalName = file.originalname.split(".")[0].replace(/\s+/g, '_') + "_" + Date.now();
    if (!uploadFolder) {
      uploadFolder = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "_" + Date.now();
    }
    const uploadPath = `uploads/${uploadFolder}/videos`;
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath)

  },
  filename: (req, file, cb) => {

    const isImage = file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg';

    if (isImage) {
      cb(null, globalName + ".png")
    } else {
      cb(null, globalName);
    }

  },
})

const fileFilter = async (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
) => {
  console.log("file", file);
  if (file.mimetype === "video/mp4" || file.mimetype === "video/x-matroska" || file.mimetype === "video/avi" || file.mimetype === "video/webm"
    || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'
  ) {
    console.log("Video file type supported", file);
    cb(null, true);
  }
};

export const uploadHandler = multer({
  storage: storageEngine,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 50,
  },
});

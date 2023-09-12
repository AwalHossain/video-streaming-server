import { NextFunction, Request, Response } from "express";
import fs from "fs";
import multer from "multer";



let globalName = "";
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: Function) => {
    globalName = file.originalname.split(".")[0] + "_" + Date.now();
    const uploadPath = `uploads/${globalName}/videos`;
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, globalName);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
) => {
  if (file.mimetype === "video/mp4" || file.mimetype === "video/x-matroska") {
    console.log("file type supported", file);
    cb(null, true);
  } else {
    console.log("file type not supported", file);
    cb(new Error("File type not supported"), false);
  }
};

const upload = multer({
  dest: "uploads/videos",
  fileFilter,
  limits: { fileSize: 50000000 },
  storage,
}).single("video");

const uploadProcessor = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err: any) => {
    if (err) {
      console.error(err);
      res.status(400).json({ status: "error", error: err });
      return;
    } else {
      console.log("upload success", req.file);
      next();
    }
  });
};



export default uploadProcessor;
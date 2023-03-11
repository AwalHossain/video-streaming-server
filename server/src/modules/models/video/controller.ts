/**
 * make it typescript friendly
 */

import { Express, NextFunction, Request, Response } from "express";
import multer from "multer";

import { QUEUE_EVENTS } from "../../queues/constants";
import { name } from "./model";
// import { deleteById, getById, insert, search, update } from "./service";

import { addQueueItem } from "../../queues/queue";
import { getFakeVideosData } from "./data";

const BASE_URL = `/api/${name}`;

const setupRoutes = (app: Express): void => {
  console.log(`Setting up routes for ${name}`);

  // return empty response with success message for the base route
  app.get(`${BASE_URL}/`, async (req: Request, res: Response) => {
    console.log(`GET`, req.params);
    res.send({
      status: "success",
      message: "OK",
      timestamp: new Date(),
      data: getFakeVideosData(),
    });
  });

  // app.get(`${BASE_URL}/detail/:id`, async (req: Request, res: Response) => {
  //   console.log(`GET`, req.params);
  //   const student = await getById(req.params.id);
  //   res.send(student);
  // });

  // // TODO: Proper searching with paging and ordering
  // app.post(`${BASE_URL}/search`, async (req: Request, res: Response) => {
  //   console.log("POST search", req.body);
  //   const result = await search(req.body);
  //   res.send(result);
  // });

  // app.post(`${BASE_URL}/create`, async (req: Request, res: Response) => {
  //   console.log("POST create", req.body);
  //   const validationResult = validate(req.body);
  //   if (!validationResult.error) {
  //     const result = await insert(req.body);
  //     if (result instanceof Error) {
  //       res.status(400).json(JSON.parse(result.message));
  //       return;
  //     }
  //     return res.json(result);
  //   }
  //   return res
  //     .status(400)
  //     .json({ status: "error", message: validationResult.error });
  // });

  // app.put(`${BASE_URL}/update/:id`, async (req: Request, res: Response) => {
  //   console.log("PUT", req.params.id);
  //   const validationResult = validate(req.body);
  //   if (req.params.id && !validationResult.error) {
  //     const result = await update(req.params.id, req.body);
  //     if (result instanceof Error) {
  //       res.status(400).json(JSON.parse(result.message));
  //       return;
  //     }
  //     return res.json(result);
  //   }
  //   return res
  //     .status(400)
  //     .json({ status: "error", message: validationResult.error });
  // });

  // app.delete(`${BASE_URL}/delete/:id`, async (req: Request, res: Response) => {
  //   console.log("DELETE", req.params.id);
  //   if (req.params.id) {
  //     const result = await deleteById(req.params.id);
  //     if (result instanceof Error) {
  //       res.status(400).json(JSON.parse(result.message));
  //       return;
  //     }
  //     return res.json(result);
  //   }
  //   return res.status(400).json({ status: "error", message: "Id required" });
  // });

  // upload videos handler using multer package routes below.

  const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: Function) => {
      cb(null, "uploads/videos");
    },
    filename: (req: Request, file: Express.Multer.File, cb: Function) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix);
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

  app.post(
    `${BASE_URL}/upload`,
    uploadProcessor,
    async (req: Request, res: Response) => {
      try {
        console.log("POST upload", JSON.stringify(req.body));
        const payload: any = { ...req.body };
        console.log("user given metadata", "title", payload.title);
        await addQueueItem(QUEUE_EVENTS.VIDEO_UPLOADED, {
          ...payload,
          ...req.file,
        });
        res
          .status(200)
          .json({ status: "success", message: "Upload success", ...req.file });
        return;
      } catch (error) {
        console.error(error);
        res.send(error);
      }
    }
  );
};

export { setupRoutes };

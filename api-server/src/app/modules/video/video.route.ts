import { Router } from "express";

import isAuthenticated from "../../middleware/isAuthenticated";
import { VideoController } from "./video.controller";

const router = Router();

router.post("/insert", isAuthenticated, VideoController.insertVideo);

router.get("/", VideoController.getAllVideos);

// get user videos

router.get("/myvideos", isAuthenticated, VideoController.getMyVideos);

router.put("/update/:id", isAuthenticated, VideoController.updateVideo);

router.patch("/updateHistory/:id", VideoController.updateHistory);

// router.get("/:id", VideoController.getById);

export const VideoRoutes = router;

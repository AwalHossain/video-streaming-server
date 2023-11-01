import { Router } from 'express';
import { uploadHandler } from "../../../app/middleware/uploadMiddleware";
import { VideoController } from "./video.controller";

const router = Router();


router.post('/upload',
    uploadHandler.fields([
        { name: 'video', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ]),
    VideoController.uploadVideo
)

router.patch('/updateHistory/:id',
    VideoController.updateHistory
)



export const VideoRoutes = router;
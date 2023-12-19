import { Router } from 'express';
import isAuthenticated from '../../../app/middleware/isAuthenticated';
import { uploadHandler } from "../../../app/middleware/uploadMiddleware";
import { VideoController } from "./video.controller";

const router = Router();


router.post('/upload',
    isAuthenticated,
    uploadHandler.fields([
        { name: 'video', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ]),
    VideoController.uploadVideo
)

router.get('/', VideoController.getAllVideos)

router.put('/update/:id',
    VideoController.updateVideo
)

router.patch('/updateHistory/:id',
    VideoController.updateHistory
)

router.get('/:id',
    VideoController.getById
)


export const VideoRoutes = router;
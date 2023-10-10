import { Router } from 'express';
import uploadProcessor from '../../../app/middleware/uploadMiddleware';
import { VideoController } from './video.controller';


const router = Router();


router.post('/upload',
    uploadProcessor,
    VideoController.uploadVideo
)

router.patch('/updateHistory/:id',
    VideoController.updateHistory
)



export const VideoRoutes = router;
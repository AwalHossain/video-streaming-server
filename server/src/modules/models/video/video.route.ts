import { Router } from 'express';
import uploadProcessor from '../../../middleware/uploadMiddleware';
import { VideoController } from './video.controller';


const router = Router();


router.post('/upload',
uploadProcessor,
VideoController.uploadVideo
)



export const VideoRoutes = router;
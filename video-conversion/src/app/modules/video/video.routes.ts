import {Router} from 'express';
import { videoController } from './video.controller';
import { uploadMiddleware } from '../../middleware/uploadMiddleware';
import isAuthenticated from '../../middleware/isAuthenticated';


const router = Router();


router.post('/upload',
isAuthenticated,
uploadMiddleware.fields([
    { name: 'video', maxCount: 1 },
    { name: 'image', maxCount: 1 }
    ]),
videoController.uploadVideo);



export const videoRoutes = router;
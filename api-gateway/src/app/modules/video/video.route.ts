import { Router } from 'express';
import { uploadMiddleware } from '../../middleware/uploadMiddleware';
import { VideoController } from './video.controller';

const router = Router();

router.post(
  '/upload',
  uploadMiddleware.single('video'),
  VideoController.uploadToBucket,
);

export const VideoRoutes = router;

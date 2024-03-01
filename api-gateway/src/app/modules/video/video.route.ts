import { Router } from 'express';
import isAuthenticated from '../../middleware/isAuthenticated';
import { uploadMiddleware } from '../../middleware/uploadMiddleware';
import { VideoController } from './video.controller';

const router = Router();

router.post(
  '/upload',
  isAuthenticated,
  uploadMiddleware.single('video'),
  VideoController.uploadToBucket,
);

export const VideoRoutes = router;

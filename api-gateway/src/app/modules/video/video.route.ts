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

router.get('/', VideoController.getAllVideos);
router.get('/myvideos', isAuthenticated, VideoController.getMyVideos);
router.put('/update/:id', isAuthenticated, VideoController.updateVideo);
router.get('/:id', VideoController.getVideoById);

export const VideoRoutes = router;

import { Router } from 'express';
import isAuthenticated from '../../middleware/isAuthenticated';
import { VideoController } from './video.controller';

const router = Router();



router.post('/presigned-url',
  isAuthenticated,
  VideoController.getPresignedUrl);

router.post('/confirm-upload',
  isAuthenticated,
  VideoController.confirmUpload);

router.get('/', VideoController.getAllVideos);
router.get('/myvideos', isAuthenticated, VideoController.getMyVideos);
router.put('/update/:id', isAuthenticated, VideoController.updateVideo);
router.get('/:id', VideoController.getVideoById);

export const VideoRoutes = router;

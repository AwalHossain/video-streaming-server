import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { VideoRoutes } from '../modules/video/video.route';

const router = Router();

const ModuleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/videos',
    route: VideoRoutes,
  },
];

ModuleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;

import { Router } from 'express';
import { videoRoutes } from '../modules/video/video.routes';



const router = Router();



const ModuleRoutes = [
    {
        path: '/video',
        route: videoRoutes
    },
]


ModuleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})


export default router;
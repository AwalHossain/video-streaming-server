import { Router } from 'express';
import { UserRoutes } from '../modules/models/user/user.route';
import { VideoRoutes } from '../modules/models/video/video.route';


const router = Router();



const ModuleRoutes = [
    {
        path: '/videos',
        route: VideoRoutes
    },
    {
        path: '/auth',
        route: UserRoutes

    }
]


ModuleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})


export default router;
import { Router } from 'express';
import { VideoRoutes } from '../modules/models/video/video.route';


const router = Router();



const ModuleRoutes = [
    {
        path: '/videos',
        route: VideoRoutes
    }
]


ModuleRoutes.forEach((route)=>{
    router.use(route.path, route.route)
})


export default router;
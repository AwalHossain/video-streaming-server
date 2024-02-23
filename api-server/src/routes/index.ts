import { Router } from "express";
import { UserRoutes } from "../app/modules/user/user.route";
import { VideoRoutes } from "../app/modules/video/video.route";

const router = Router();

const ModuleRoutes = [
  {
    path: "/videos",
    route: VideoRoutes,
  },
  {
    path: "/auth",
    route: UserRoutes,
  },
];

ModuleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;

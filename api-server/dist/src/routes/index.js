"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_route_1 = require("../app/modules/user/user.route");
const video_route_1 = require("../app/modules/video/video.route");
const router = (0, express_1.Router)();
const ModuleRoutes = [
    {
        path: "/videos",
        route: video_route_1.VideoRoutes,
    },
    {
        path: "/auth",
        route: user_route_1.UserRoutes,
    },
];
ModuleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;

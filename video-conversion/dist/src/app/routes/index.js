"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const video_routes_1 = require("../modules/video/video.routes");
const router = (0, express_1.Router)();
const ModuleRoutes = [
    {
        path: '/video',
        route: video_routes_1.videoRoutes
    },
];
ModuleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;

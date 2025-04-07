"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const config_1 = __importDefault(require("../../../config"));
const sendResponse_1 = require("../../../shared/sendResponse");
const jwt_1 = require("../../../utils/jwt");
const isAuthenticated_1 = __importDefault(require("../../middleware/isAuthenticated"));
const user_controller_1 = require("./user.controller");
const user_service_1 = require("./user.service");
const router = express_1.default.Router();
router.post("/register", user_controller_1.UserController.registrationUser);
router.post("/login", user_controller_1.UserController.loginUser);
// router for initial google login
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
// Route for handling the callback from Google
router.get("/google/callback", passport_1.default.authenticate("google"), (req, res) => {
    console.log(req.user, "req.user");
    const token = (0, jwt_1.createToken)(req.user._id);
    const user = {
        statusCode: 200,
        success: true,
        message: "Google Logged In Successfully!",
        data: {
            ...req.user.toObject(),
            accessToken: token,
        },
    };
    // Redirect back to the API Gateway with the user data in the query string
    console.log(config_1.default.apiGatway, "config.apiGatway");
    res.redirect(`${config_1.default.apiGatway}/auth/google/callback?user=${encodeURIComponent(JSON.stringify(user))}`);
});
router.get("/logout", user_controller_1.UserController.logoutUser);
router.get("/check-session", isAuthenticated_1.default, async (req, res) => {
    const id = req.user.id;
    const user = await user_service_1.UserService.getUserById(id);
    console.log("user", user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "User Session is active !",
        data: user,
    });
});
exports.UserRoutes = router;

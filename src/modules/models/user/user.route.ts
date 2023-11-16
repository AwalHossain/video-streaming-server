import express from "express";
import passport from "passport";
import isAuthenticated from "../../../app/middleware/isAuthenticated";
import config from "../../../config";
import { sendResponse } from "../../../shared/sendResponse";
import { UserController } from "./user.controller";

const router = express.Router();


router.post("/signup",
    UserController.registrationUser
)

router.post("/login",
    UserController.loginUser
)

// router for initial google login
router.get("/google", passport.authenticate('google', { scope: ['profile', 'email'] }))

// Route for handling the callback from Google

router.get("/google/callback", passport.authenticate("google", {
    successRedirect: `${config.clientUrl}`
}), (req, res) => {
    console.log(req.user, 'req.user');

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Google Logged In Successfully!',
        data: req.user,
    })
})

router.get("/logout",
    UserController.logoutUser
)


router.get("/check-session", isAuthenticated, (req, res) => {
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User Session is active !',
        data: req.user,
    })
})

export const UserRoutes = router;



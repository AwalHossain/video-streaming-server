import express from "express";
import passport from "passport";
import isAuthenticated from "../../../app/middleware/isAuthenticated";
import config from "../../../config";
import { sendResponse } from "../../../shared/sendResponse";
import { createToken } from "../../../utils/jwt";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

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

router.get("/google/callback", passport.authenticate("google"), (req, res) => {
    console.log(req.user, 'req.user');

    const token = createToken((req.user as any)._id);
    const user = {
        statusCode: 200,
        success: true,
        message: 'Google Logged In Successfully!',
        data: {
            ...(req.user as any).toObject(),
            accessToken: token,
        },
    };

    // Send a script that posts a message to the opener window
    res.send(`
        <script>
            window.opener.postMessage(${JSON.stringify(user)}, "${config.clientUrl}");
            window.close();
        </script>
    `);
})

router.get("/logout",
    UserController.logoutUser
)


router.get("/check-session", isAuthenticated, async (req, res) => {

    const id = (req.user as any).id;
    const user = await UserService.getUserById(id);
    console.log("user", user);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User Session is active !',
        data: user,
    })
})

export const UserRoutes = router;



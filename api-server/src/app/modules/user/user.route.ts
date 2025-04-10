import express from "express";
import passport from "passport";

import config from "../../../config";
import { sendResponse } from "../../../shared/sendResponse";
import { createToken } from "../../../utils/jwt";
import isAuthenticated from "../../middleware/isAuthenticated";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

const router = express.Router();

router.post("/register", UserController.registrationUser);

router.post("/login", UserController.loginUser);

// router for initial google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Route for handling the callback from Google

router.get("/google/callback", passport.authenticate("google"), (req, res) => {
  console.log(req.user, "req.user");

  const token = createToken((req.user as any)._id);
  const user = {
    statusCode: 200,
    success: true,
    message: "Google Logged In Successfully!",
    data: {
      ...(req.user as any).toObject(),
      accessToken: token,
    },
  };

  // Redirect back to the API Gateway with the user data in the query string
  console.log(config.apiGatway,"config.apiGatway");
  
  res.redirect(
    `${config.apiGatway}/auth/google/callback?user=${encodeURIComponent(
      JSON.stringify(user)
    )}`
  );
});
router.get("/logout", UserController.logoutUser);

router.get("/check-session", isAuthenticated, async (req, res) => {
  const id = (req.user as any).id;
  const user = await UserService.getUserById(id);
  console.log("user", user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Session is active !",
    data: user,
  });
});

router.get("/:id", UserController.getUserById);

export const UserRoutes = router;

import express from "express";
import { UserController } from "./user.controller";

const router = express.Router();


router.get("/signup",
    UserController.registrationUser
)

router.get("/login",
    UserController.loginUser
)

router.get("/logout",
    UserController.logoutUser
)


export const UserRoutes = router;



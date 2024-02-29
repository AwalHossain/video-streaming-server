import express from 'express';
import { AuthController } from './auth.controller';

const router = express.Router();

router.post('/register', AuthController.registrationUser);

router.post('/login', AuthController.loginUer);

export const AuthRoutes = router;

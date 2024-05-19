import express, { Request, Response } from 'express';
import config from '../../../config';
import { AuthController } from './auth.controller';

const router = express.Router();

router.post('/register', AuthController.registrationUser);

router.post('/login', AuthController.loginUer);

router.get('/check-session', AuthController.checkSession);

router.get('/google', (req: Request, res: Response) => {
  res.redirect(`${config.services.api}/auth/google`);
});

router.get('/google/callback', (req: Request, res: Response) => {
  // Extract the user data from the query string
  const user = JSON.parse(decodeURIComponent(req.query.user as string));
  console.log(user, 'user');

  // Send a script that posts a message to the opener window
  res.send(`
    <script>
        window.opener.postMessage(${JSON.stringify(user)}, "${config.services.client}");
        window.close();
    </script>
  `);
});

export const AuthRoutes = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("../../../config"));
const auth_controller_1 = require("./auth.controller");
const router = express_1.default.Router();
router.post('/register', auth_controller_1.AuthController.registrationUser);
router.post('/login', auth_controller_1.AuthController.loginUer);
router.get('/check-session', auth_controller_1.AuthController.checkSession);
router.get('/google', (req, res) => {
    res.redirect(`${config_1.default.services.api}/auth/google`);
});
router.get('/google/callback', (req, res) => {
    // Extract the user data from the query string
    const user = JSON.parse(decodeURIComponent(req.query.user));
    console.log(user, 'user');
    // Send a script that posts a message to the opener window
    res.send(`
    <script>
        window.opener.postMessage(${JSON.stringify(user)}, "${config_1.default.services.client}");
        window.close();
    </script>
  `);
});
exports.AuthRoutes = router;
//# sourceMappingURL=auth.routes.js.map
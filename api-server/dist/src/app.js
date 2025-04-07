"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const globalErrorhandler_1 = __importDefault(require("./app/middleware/globalErrorhandler"));
const passport_config_1 = require("./config/passport-config");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use(express_1.default.urlencoded({ extended: true }));
app.use(passport_1.default.initialize());
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    name: "__session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use((0, cookie_parser_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({
    origin: [process.env.CLIENT_URL1, process.env.CLIENT_URL2],
    credentials: true,
}));
(0, passport_config_1.passportConfig)();
app.use(`/api/v1`, routes_1.default);
app.use(globalErrorhandler_1.default);
//handle not found
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Not Found",
        errorMessages: [
            {
                path: req.originalUrl,
                message: "API Not Found",
            },
        ],
    });
    next();
});
exports.default = app;

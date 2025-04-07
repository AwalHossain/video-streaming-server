"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passportConfig = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const _1 = __importDefault(require("."));
const user_model_1 = require("../app/modules/user/user.model");
const passportConfig = () => {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: _1.default.googleClientId,
        clientSecret: _1.default.googleClientSecret,
        callbackURL: _1.default.googleCallbackUrl,
    }, async (accessToken, refreshToken, profile, done) => {
        let user = await user_model_1.User.findOne({ googleId: profile.id });
        console.log(profile, "profile");
        console.log(user, "user");
        if (!user) {
            user = await user_model_1.User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
            });
            console.log(user, "user");
        }
        done(null, user);
    }));
    // // serialize user
    passport_1.default.serializeUser((user, done) => {
        done(null, user.email);
    });
    // deserialize user
    passport_1.default.deserializeUser(async (user, done) => {
        const userData = await user_model_1.User.findOne({ email: user });
        done(null, userData);
    });
};
exports.passportConfig = passportConfig;

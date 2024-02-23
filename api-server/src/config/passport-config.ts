import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from ".";
import { IUser } from "../app/modules/user/user.interface";
import { User } from "../app/modules/user/user.model";

export const passportConfig = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: config.googleCallbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        let user = await User.findOne({ googleId: profile.id });
        console.log(profile, "profile");
        console.log(user, "user");
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
          });

          console.log(user, "user");
        }

        done(null, user);
      }
    )
  );

  // // serialize user
  passport.serializeUser((user: IUser, done) => {
    done(null, user.email);
  });
  // deserialize user
  passport.deserializeUser(async (user, done) => {
    const userData = await User.findOne({ email: user });
    done(null, userData);
  });
};

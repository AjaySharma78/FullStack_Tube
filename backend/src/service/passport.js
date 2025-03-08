import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/user.model.js";
import { ApiErrors } from "../utils/apiError.js";
import { generateAccessTokenAndRefreshToken } from "../controllers/user.controller.js";
import config from "../env/config.js";
passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: config.googleCallbackUrl,
      tokenURL: config.googleTokenUrl,
      prompt: "consent",
      accessType: "offline",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let isuser = await User.findOne({ googleId: profile.id });

        if (!isuser) {
          // Check if the email already exists
          const existingUserByEmail = await User.findOne({
            email: profile.emails[0].value,
          });
          if (existingUserByEmail) {
            // Update the existing user with the Google ID
            existingUserByEmail.googleId = profile.id;
            await existingUserByEmail.save();
            isuser = existingUserByEmail;
          } else {
            let userName = profile.displayName;
            let existingUser = await User.findOne({ userName });

            while (existingUser) {
              const randomSuffix = Math.floor(Math.random() * 10000);
              userName = `${profile.displayName}${randomSuffix}`;
              existingUser = await User.findOne({ userName });
            }

            isuser = await User.create({
              googleId: profile.id,
              userName,
              email: profile.emails[0].value,
              isEmailVerified: true,
              avatar: profile.photos[0].value,
              fullName: profile.displayName,
              coverImage: profile.photos[0].value || "",
              password: profile.id,
              lastUsernameChange: new Date(),
            });
          }
        }
        
        const { accessToken, refreshToken } =
          await generateAccessTokenAndRefreshToken(isuser._id);

        const user = await User.findById(isuser._id).select(
        "-password -refreshToken -verifyToken -verifyTokenExpires -lastUsernameChange -createdAt -updatedAt -__v -githubId -googleId -watchHistory -twoFactorBackupCodes"
        );

        if (!user) {
          return done(new ApiErrors(404, "User not found"), false);
        }


        const options = {
          httpOnly: true,
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,  
        };
        return done(null,user, { accessToken, refreshToken, options });
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: config.githubClientId,
      clientSecret: config.githubClientSecret,
      callbackURL: config.githubCallbackUrl,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let isuser = await User.findOne({ githubId: profile.id });

        if (!isuser) {
          // Retrieve email from profile.emails
          const email =
            profile.emails && profile.emails.length > 0
              ? profile.emails[0].value
              : null;

          if (!email) {
            throw new ApiErrors(400, "Email not found in GitHub profile");
          }

          // Check if the email already exists
          const existingUserByEmail = await User.findOne({ email });
          if (existingUserByEmail) {
            // Update the existing user with the GitHub ID
            existingUserByEmail.githubId = profile.id;
            await existingUserByEmail.save();
            isuser = existingUserByEmail;
          } else {
            let userName = profile.username;
            let existingUser = await User.findOne({ userName });

            while (existingUser) {
              const randomSuffix = Math.floor(Math.random() * 10000);
              userName = `${profile.username}${randomSuffix}`;
              existingUser = await findOne({ userName });
            }

            isuser = await User.create({
              githubId: profile.id,
              fullName: profile.displayName,
              avatar: profile.photos[0].value,
              coverImage: profile.photos[0].value || "",
              userName,
              email: profile.emails[0].value,
              password: profile.id,
              lastUsernameChange: new Date(),
              isEmailVerified: true,
            });
          }
        }
        const { accessToken, refreshToken } =
          await generateAccessTokenAndRefreshToken(isuser._id);
        const user = await User.findById(isuser._id).select(
          "-password -refreshToken -verifyToken -verifyTokenExpires -lastUsernameChange -createdAt -updatedAt -__v -githubId -googleId -watchHistory -twoFactorBackupCodes"
        );
        if (!user) {
          return done(new ApiErrors(404, "User not found"), false);
        }


        const options = {
          httpOnly: true,
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,  
        };

        return done(null,user,{accessToken, refreshToken, options });
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});

export default passport;

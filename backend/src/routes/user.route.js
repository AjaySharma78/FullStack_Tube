import {
  registerUsers,
  loginUsers,
  logoutUser,
  refreshAccessToken,
  changePassword,
  updateUserEmailUsername,
  updateUserAvatar,
  updateUserCoverImage,
  getCurrentUser,
  verifyUserEmail,
  resendEmailVerification,
  sendForgotPasswordEmail,
  resetPassword,
  googleOAuthCallback,
  githubOAuthCallback,
  getloginUserChannelProfile,
  getUserChannelProfile,
  getWatchHistory,
  userNameValidation,
  generate2FASecret,
  verify2FAToken,
  disable2FA
} from "../controllers/user.controller.js";
import passport from "passport";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginUsers);
router.route("/verify-email").post(verifyUserEmail);
router.route("/reset-password").patch(resetPassword);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/channel/:userName").get(getUserChannelProfile);
router.route("/forgot-password").post(sendForgotPasswordEmail);
router.route("/resend-verification-email").post(resendEmailVerification);
router.route("/validate-username").post(userNameValidation);
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUsers
);
router.route("/generate-2fa-secret").post(verifyUser, generate2FASecret);
router.route("/verify-2fa-token").post( verify2FAToken);
router.route("/disable-2fa").post(verifyUser, disable2FA);
router.route("/logout").post(verifyUser, logoutUser);
router.route("/watch-history").get(verifyUser, getWatchHistory);
router.route("/change-password").post(verifyUser, changePassword);
router.route("/get-current-user").get(verifyUser, getCurrentUser);
router
  .route("/update/u/email-username-fullname")
  .patch(verifyUser, updateUserEmailUsername);
router
  .route("/user-channel-profile")
  .get(verifyUser, getloginUserChannelProfile);
router
  .route("/update-avatar")
  .patch(verifyUser, upload.single("avatar"), updateUserAvatar);
router
  .route("/update-cover-image")
  .patch(verifyUser, upload.single("coverImage"), updateUserCoverImage);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/signup" }),
  googleOAuthCallback
);

router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "http://localhost:5173/signup" }),
  githubOAuthCallback
);

export default router;

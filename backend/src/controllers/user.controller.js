import {
  uploadTOCloudinary,
  deleteFromCloudinary,
} from "../service/cloudinaryService.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendMail } from "../service/sendMail.js";
import { ApiErrors } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import config from "../env/config.js";
import speakeasy from "speakeasy";
import CryptoJS from "crypto-js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import fs from "fs";

function unlinkPath(avatarLocalPath, coverImageLocalPath) {
  if (avatarLocalPath) fs.unlinkSync(avatarLocalPath);
  if (coverImageLocalPath) fs.unlinkSync(coverImageLocalPath);
}

const generateBackupCode = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let backupCode = "";
  for (let i = 0; i < 10; i++) {
    backupCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return backupCode;
};

const registerUsers = asyncHandler(async (req, res) => {
  const { userName, email, fullName, password } = req.body;

  if (
    [userName, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    unlinkPath(req.files?.avatar[0]?.path, req.files?.coverImage[0]?.path);
    throw ApiErrors.badRequest("Please fill all fields");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    unlinkPath(req.files?.avatar[0]?.path, req.files?.coverImage[0]?.path);
    throw ApiErrors.badRequest("Email already exists");
  }

  const avatarPath = req.files?.avatar[0]?.path;

  let coverImagePath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImagePath = req.files.coverImage[0].path;
  }

  if (!avatarPath) {
    unlinkPath(avatarPath, coverImagePath);
    throw ApiErrors.badRequest("Avatar is required");
  }

  const avatar = await uploadTOCloudinary(avatarPath, "user", "image");
  const coverImage = await uploadTOCloudinary(coverImagePath, "user", "image");

  if (!avatar) {
    throw ApiErrors.internal("Something went wrong while uploading avatar");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    userName: userName.toLowerCase(),
    email,
    password,
    lastUsernameChange: new Date(),
  });

  const emailToken = await generateToken(user._id);
  const createdUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        verifyToken: emailToken,
        verifyTokenExpires: Date.now() + 30 * 60 * 1000,
      },
    },
    {
      new: true,
    }
  ).select(
    "-password -refreshToken -verifyToken -verifyTokenExpires -isEmailVerified -lastUsernameChange -createdAt -updatedAt -__v -githubId -googleId -watchHistory -coverImage -avatar -userName "
  );

  if (!createdUser) {
    throw ApiErrors.internal("Something went wrong while creating user");
  }

  sendMail({
    email: user.email,
    subject: "Email Verification",
    text: `${config.clientUrl}/verify-email?token=${emailToken}`,
  });

  setTimeout(
    async () => {
      const updatedUser = await User.findById(user._id);
      if (updatedUser && !updatedUser.isEmailVerified) {
        await User.findByIdAndDelete(user._id);
        sendMail({
          email: user.email,
          subject: "Account Deletion",
          text: "Your account has been deleted as the email was not verified within 15 minutes.",
        });
      }
    },
    15 * 60 * 1000
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registred successfully"));
});

const loginUsers = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier) {
    throw ApiErrors.badRequest("Please provide username or email");
  }

  if (!password) {
    throw ApiErrors.badRequest("Please provide password");
  }

  const existedUser = await User.findOne({
    $or: [{ userName: identifier }, { email: identifier }],
  });

  if (!existedUser) {
    throw ApiErrors.notFound("User not found");
  }
  const isPasswordCorrect = await existedUser.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw ApiErrors.unauthorized("Password is incorrect");
  }

  if (!existedUser.isEmailVerified) {
    throw ApiErrors.unauthorized("Please verify your email to login");
  }

  if (existedUser.isTwoFactorEnabled) {
    const userInfo = await User.findById(existedUser._id).select(
      "-password -refreshToken -verifyToken -verifyTokenExpires -lastUsernameChange -createdAt -updatedAt -__v -githubId -googleId -watchHistory"
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { twoFactorEnabled: true, _id: userInfo._id },
          "Two factor authentication enabled"
        )
      );
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(existedUser._id);

  const loggedInUser = await User.findById(existedUser._id).select(
    "-password -refreshToken -verifyToken -verifyTokenExpires -lastUsernameChange -createdAt -updatedAt -__v -githubId -googleId -watchHistory"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",

    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };
  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw ApiErrors.badRequest("Invalid user id");
  }

  if (!oldPassword || !newPassword) {
    throw ApiErrors.badRequest("Please provide old password and new password");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  if (userId.toString() !== user._id.toString()) {
    throw ApiErrors.forbidden("You are not authorized to update this user");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw ApiErrors.unauthorized("Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  sendMail({
    email: user.email,
    subject: "Password Changed",
    text: "Your password has been changed successfully",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateUserEmailUsername = asyncHandler(async (req, res) => {
  const { userName, email, fullName } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw ApiErrors.badRequest("Invalid user id");
  }

  if (!userName && !email && !fullName) {
    throw ApiErrors.badRequest("Please provide username or email or fullName");
  }

  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  if (userId.toString() !== user._id.toString()) {
    throw ApiErrors.forbidden("You are not authorized to update this email");
  }

  if (userName) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    if (user.lastUsernameChange && user.lastUsernameChange > threeMonthsAgo) {
      throw ApiErrors.badRequest(
        "You can only change your username once every three months"
      );
    }

    user.userName = userName;
    user.lastUsernameChange = new Date();
  }
  if (fullName) {
    user.fullName = fullName;
  }

  let previousEmail;
  if (email) {
    previousEmail = user.email;
    user.email = email;
    user.isEmailVerified = false;
    const emailToken = await generateToken(user._id);
    user.verifyToken = emailToken;
    user.verifyTokenExpires = Date.now() + 30 * 60 * 1000;
    sendMail({
      email: user.email,
      subject: "Email Verification",
      text: `${config.clientUrl}/verify-email?token=${emailToken}`,
    });

    setTimeout(
      async () => {
        const updatedUser = await User.findById(userId);
        if (updatedUser && !updatedUser.isEmailVerified) {
          updatedUser.email = previousEmail;
          updatedUser.isEmailVerified = true;
          updatedUser.verifyToken = null;
          updatedUser.verifyTokenExpires = null;
          await updatedUser.save({ validateBeforeSave: false });
          sendMail({
            email: previousEmail,
            subject: "Email Reverted",
            text: "Your email has been reverted to the previous email as the new email was not verified within  minutes.",
          });
        }
      },
      5 * 60 * 1000
    );
  }

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
      },
      `User updated ${fullName ? "fullName" : email ? "email" : "userName"}.${email ? "Please verify your email within 5 minuets" : ""}`
    )
  );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const Token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!Token) {
    throw ApiErrors.badRequest("Invalid token");
  }
  const decodedToken = await jwt.verify(Token, config.refreshTokenSecret);

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  if (Token !== user?.refreshToken) {
    throw ApiErrors.forbidden("Invalid token");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const token = await loggedInUser.generateTokenForCookies();

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw ApiErrors.internal("Something went wrong while generating tokens");
  }
};

const generateToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const emailToken = await user.generateEmailToken();
    return emailToken;
  } catch (error) {
    throw ApiErrors.internal("Something went wrong while generating tokens");
  }
};

const updateUserAvatar = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw ApiErrors.badRequest("Invalid user id");
  }

  const user = await User.findById(userId).select("-password -refreshToken");
  const avatarPath = req.file?.path;

  if (!user) {
    unlinkPath(avatarPath, null);
    throw ApiErrors.notFound("User not found");
  }

  if (!avatarPath) {
    unlinkPath(avatarPath, null);
    throw ApiErrors.badRequest("Avatar is required");
  }

  if (userId.toString() !== user._id.toString()) {
    unlinkPath(avatarPath, null);
    throw ApiErrors.forbidden(
      "You are not authorized to update this user avatar"
    );
  }

  const avatar = await uploadTOCloudinary(avatarPath, "user", "image");

  if (!avatar) {
    throw ApiErrors.internal("Something went wrong while uploading avatar");
  }

  const oldAvatar = user.avatar;
  if (oldAvatar) {
    const publicId = oldAvatar.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId, "user");
  }

  user.avatar = avatar.url;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
      },
      "User avatar updated successfully"
    )
  );
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImagePath = req.file?.path;
  const userId = req.user?._id;

  if (!userId) {
    throw ApiErrors.badRequest("Invalid user id");
  }

  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    unlinkPath(null, coverImagePath);
    throw ApiErrors.notFound("User not found");
  }

  if (!coverImagePath) {
    unlinkPath(null, coverImagePath);
    throw ApiErrors.badRequest("Cover image is required");
  }

  if (userId.toString() !== user._id.toString()) {
    unlinkPath(null, coverImagePath);
    throw ApiErrors.forbidden(
      "You are not authorized to update this user cover image"
    );
  }

  const coverImage = await uploadTOCloudinary(coverImagePath, "user", "image");

  if (!coverImage) {
    throw ApiErrors.internal(
      500,
      "Something went wrong while uploading cover image"
    );
  }

  const oldCoverImage = user.coverImage;
  if (oldCoverImage) {
    const publicId = oldCoverImage.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId, "user");
  }

  user.coverImage = coverImage.url;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
      },
      "User cover image updated successfully"
    )
  );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  const userResInfo = {
    _id: user._id,
    userName: user.userName,
    email: user.email,
    fullName: user.fullName,
    avatar: user.avatar,
    coverImage: user.coverImage,
    isEmailVerified: user.isEmailVerified,
    isTwoFactorEnabled: user.isTwoFactorEnabled,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: userResInfo,
      },
      "User fetched successfully"
    )
  );
});

const verifyUserEmail = asyncHandler(async (req, res) => {
  const token = req.query?.token || req.body?.token;

  if (!token) {
    throw ApiErrors.unauthorized("Invalid token");
  }

  const user = await User.findOne({
    verifyToken: token,
    verifyTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiErrors.unauthorized("Invalid token or token expired");
  }

  user.isEmailVerified = true;
  user.verifyToken = null;
  user.verifyTokenExpires = null;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
      },
      "User email verified successfully"
    )
  );
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw ApiErrors.badRequest("Please provide email");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  if (user.isEmailVerified) {
    throw ApiErrors.badRequest("Email is already verified");
  }

  const emailToken = await generateToken(user._id);
  const userInfo = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        verifyToken: emailToken,
        verifyTokenExpires: Date.now() + 15 * 60 * 1000,
      },
    },
    {
      new: true,
    }
  ).select(
    "-password -refreshToken -verifyToken -verifyTokenExpires -isEmailVerified -lastUsernameChange -createdAt -updatedAt -__v -githubId -googleId -watchHistory"
  );

  if (!userInfo) {
    throw ApiErrors.notFound("User not found");
  }

  sendMail({
    email: user.email,
    subject: "Email Verification",
    text: `${config.clientUrl}/verify-email?token=${emailToken}`,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verification sent successfully"));
});

const sendForgotPasswordEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw ApiErrors.badRequest("Please provide email");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  const forgotPasswordEmailToken = await generateToken(user._id);
  const userInfo = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        forgotPasswordToken: forgotPasswordEmailToken,
        forgotPasswordTokenExpires: Date.now() + 15 * 60 * 1000,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!userInfo) {
    throw ApiErrors.notFound("User not found");
  }

  sendMail({
    email: user.email,
    subject: "Reset Password",
    text: `${config.clientUrl}/reset-password?token=${forgotPasswordEmailToken}`,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Reset password email sent successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword, token } = req.body;

  if (!newPassword || !token) {
    throw ApiErrors.badRequest("Please provide new password and token");
  }

  const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw ApiErrors.unauthorized("Invalid token or token expired");
  }

  user.password = newPassword;
  user.forgotPasswordToken = null;
  user.forgotPasswordTokenExpires = null;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
      },
      "Password reset successfully"
    )
  );
});

const googleOAuthCallback = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, options } = req.authInfo;
  const user = req.user;

  if (user.isTwoFactorEnabled) {
    const userInfo = await User.findById(user._id).select(
      "-password -refreshToken -verifyToken -verifyTokenExpires -lastUsernameChange -createdAt -updatedAt -__v -githubId -googleId -watchHistory"
    );
    const encryptedUserId = CryptoJS.AES.encrypt(
      JSON.stringify(userInfo._id),
      config.cryptoSecret
    ).toString();

    return res
      .status(200)
      .redirect(
        `${config.clientUrl}/verify-two-factor-auth?twoFactorEnabled=true&userId=${encodeURIComponent(encryptedUserId)}`
      );
  }

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .redirect(`${config.clientUrl}`);
});

const githubOAuthCallback = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, options } = req.authInfo;
  const user = req.user;

  if (user.isTwoFactorEnabled) {
    const userInfo = await User.findById(user._id).select(
      "-password -refreshToken -verifyToken -verifyTokenExpires -lastUsernameChange -createdAt -updatedAt -__v -githubId -googleId -watchHistory"
    );

    const encryptedUserId = CryptoJS.AES.encrypt(
      JSON.stringify(userInfo._id),
      config.cryptoSecret
    ).toString();

    return res
      .status(200)
      .redirect(
        `${config.clientUrl}/verify-two-factor-auth?twoFactorEnabled=true&userId=${encodeURIComponent(encryptedUserId)}`
      );
  }

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .redirect(`${config.clientUrl}`);
});

const getloginUserChannelProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw ApiErrors.badRequest("Invalid user id");
  }

  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(`${userId}`),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "channels",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "videoOwner",
        as: "videos",
        pipeline: [
          {
            $match: {
              isPublished: true,
            },
          },
          {
            $project: {
              title: 1,
              description: 1,
              duration: 1,
              views: 1,
              videoFile: 1,
              thumbnail: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        channelCount: { $size: "$channels" },
        videoCount: { $size: "$videos" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        avatar: 1,
        subscriberCount: 1,
        channelCount: 1,
        isSubscribed: 1,
        coverImage: 1,
        createdAt: 1,
        videos: 1,
        videoCount: 1,
      },
    },
  ]);

  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, user[0], "User channel profile fetched successfully")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;
  const { userId } = req.query;

  if (!userName.trim()) {
    throw ApiErrors.badRequest("Invalid username");
  }

  const user = await User.aggregate([
    {
      $match: {
        userName: { $regex: new RegExp(userName, "i") },
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "channels",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "videoOwner",
        as: "videos",
        pipeline: [
          {
            $match: {
              isPublished: true,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        channelCount: { $size: "$channels" },
        videoCount: { $size: "$videos" },
        isSubscribed: {
          $cond: {
            if: {
              $in: [
                userId == "null"
                  ? userId
                  : new mongoose.Types.ObjectId(`${userId}`),
                "$subscribers.subscriber",
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        fullName: 1,
        userName: 1,
        avatar: 1,
        subscriberCount: 1,
        channelCount: 1,
        isSubscribed: 1,
        coverImage: 1,
        createdAt: 1,
        videos: 1,
        videoCount: 1,
      },
    },
  ]);

  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0],
        user.length === 0
          ? "User not found"
          : "User channel profile fetched successfully"
      )
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).populate({
    path: "watchHistory",
    select:
      "_id description title thumbnail videoFile duration views isPublished videoOwner createdAt isLiked isDisliked numberOfLikes numberOfDislikes",
    populate: {
      path: "videoOwner",
      select: "_id userName fullName avatar isSubscribed subscriberCount",
    },
  });

  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.watchHistory,
        user.watchHistory.length === 0
          ? "User watch history is empty"
          : "User watch history fetched successfully"
      )
    );
});

const deleteWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const userHistory = req.user;
  if (!userId) {
    throw ApiErrors.badRequest("Invalid user id");
  }
  
  if(userHistory.watchHistory.length === 0) {
    throw ApiErrors.badRequest("User watch history is empty");
  }
  
  const user = await User.findByIdAndUpdate(userId, {
    $set: {
      watchHistory: [],
    },
  })

  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User watch history deleted successfully"));
});


const userNameValidation = asyncHandler(async (req, res) => {
  const { userName } = req.body;
  if (!userName) {
    throw ApiErrors.badRequest("Please provide username");
  }

  const user = await User.findOne({ userName: userName.toLowerCase() }).select(
    "userName"
  );

  if (user) {
    throw ApiErrors.badRequest("Username already exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Username is available"));
});

const generate2FASecret = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw ApiErrors.badRequest("Invalid user id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  const secret = speakeasy.generateSecret({
    name: "Aakirtsharma07.vercel.app",
    length: 64,
    symbols: true,
  });

  user.twoFactorBackupCodes = [];

  const backupCodes = new Set();
  while (backupCodes.size < 10) {
    backupCodes.add(generateBackupCode());
  }

  user.twoFactorSecret = secret.base32;
  user.twoFactorBackupCodes = Array.from(backupCodes);
  await user.save({ validateBeforeSave: false });

  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: `${user.email}`,
    issuer: "https://ajaysharma07.vercel.app",
    encoding: "base64",
  });

  const data_url = await QRCode.toDataURL(otpauthUrl);

  if (!data_url) {
    throw ApiErrors.internal("Something went wrong while generating QR code");
  }

  sendMail({
    email: user.email,
    subject: "Your 2FA Backup Codes",
    backupCodes: Array.from(backupCodes),
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { secret: secret.base32, qrCode: data_url },
        "Please scan the QR code to enable 2FA. Backup codes have been sent to your email. Please save them in a safe place."
      )
    );
});

const verify2FAToken = asyncHandler(async (req, res) => {
  const { token, userId, backupCode } = req.body;

  if (!userId) {
    throw ApiErrors.badRequest("Invalid user id");
  }

  const user = await User.findById(userId).select(
    "-password -refreshToken -verifyToken -verifyTokenExpires -lastUsernameChange -createdAt -updatedAt -__v -githubId -googleId -watchHistory"
  );

  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  if (backupCode) {
    if (!user.twoFactorBackupCodes.includes(backupCode)) {
      throw ApiErrors.unauthorized("Invalid backup code");
    }
    user.twoFactorBackupCodes = [];
    user.twoFactorSecret = null;
    user.isTwoFactorEnabled = false;
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    return res
      .status(200)
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          { user, accessToken, refreshToken },
          "Backup code verified successfully. 2FA has been disabled. Please set up 2FA again."
        )
      );
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base64",
    token,
  });

  if (!verified) {
    throw ApiErrors.unauthorized("Invalid or expired token");
  }

  user.isTwoFactorEnabled = true;
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { user, accessToken, refreshToken },
        "2FA token verified successfully"
      )
    );
});

const disable2FA = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { token } = req.body;

  if (!userId) {
    throw ApiErrors.badRequest("Invalid user id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base64",
    token,
  });

  if (!verified) {
    throw ApiErrors.unauthorized("Invalid or expired token");
  }

  user.twoFactorSecret = null;
  user.isTwoFactorEnabled = false;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, {}, "2FA disabled successfully"));
});

export {
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
  generateAccessTokenAndRefreshToken,
  githubOAuthCallback,
  getloginUserChannelProfile,
  getUserChannelProfile,
  getWatchHistory,
  userNameValidation,
  generate2FASecret,
  verify2FAToken,
  disable2FA,
  deleteWatchHistory
};

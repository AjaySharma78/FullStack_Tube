import asyncHandler from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { sendMail } from "../service/sendMail.js";
import {
  uploadTOCloudinary,
  deleteFromCloudinary,
} from "../service/cloudinaryService.js";
import jwt from "jsonwebtoken";
import config from "../env/config.js";
import fs from "fs";
import mongoose from "mongoose";

function unlinkPath(avatarLocalPath, coverImageLocalPath) {
  if (avatarLocalPath) fs.unlinkSync(avatarLocalPath);
  if (coverImageLocalPath) fs.unlinkSync(coverImageLocalPath);
}

const registerUsers = asyncHandler(async (req, res) => {
  const { userName, email, fullName, password } = req.body;

  if (
    [userName, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    unlinkPath(req.files?.avatar[0]?.path, req.files?.coverImage[0]?.path);
    throw new ApiErrors(400, "Please fill all fields");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    unlinkPath(req.files?.avatar[0]?.path, req.files?.coverImage[0]?.path);
    throw new ApiErrors(400, "User already existed");
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
    throw new ApiErrors(400, "Avatar is required");
  }

  const avatar = await uploadTOCloudinary(avatarPath, "user");
  const coverImage = await uploadTOCloudinary(coverImagePath, "user");

  if (!avatar) {
    throw new ApiErrors(500, "Something went wrong while uploading avatar");
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
  ).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiErrors(500, "Something went wrong while creating user");
  }

  sendMail({
    email: user.email,
    subject: "Email Verification",
    text: `http://localhost:3000/api/v1/users/verify-email?token=${emailToken}`,
  });

  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registred successfully"));
});

const loginUsers = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName && !email) {
    throw new ApiErrors(400, "Please provide username or email");
  }

  if (!password) {
    throw new ApiErrors(400, "Please provide password");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!existedUser) {
    throw new ApiErrors(404, "User not found");
  }
  const isPasswordCorrect = await existedUser.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiErrors(401, "Password is incorrect");
  }

  if (!existedUser.isEmailVerified) {
    throw new ApiErrors(401, "Please verify your email to login");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(existedUser._id);

  const loggedInUser = await User.findById(existedUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
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
    throw new ApiErrors(400, "Invalid user id");
  }

  if (!oldPassword || !newPassword) {
    throw new ApiErrors(400, "Please provide old password and new password");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiErrors(404, "User not found");
  }

  if (userId.toString() !== user._id.toString()) {
    throw new ApiErrors(403, "You are not authorized to update this user");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiErrors(401, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateUserEmailUsername = asyncHandler(async (req, res) => {
  const { userName, email, fullName } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiErrors(400, "Invalid user id");
  }

  if (!userName && !email && !fullName) {
    throw new ApiErrors(400, "Please provide username or email or fullName");
  }

  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    throw new ApiErrors(404, "User not found");
  }

  if (userId.toString() !== user._id.toString()) {
    throw new ApiErrors(403, "You are not authorized to update this email");
  }

  if (userName) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    if (user.lastUsernameChange && user.lastUsernameChange > threeMonthsAgo) {
      throw new ApiErrors(
        400,
        "You can only change your username once every three months"
      );
    }

    user.userName = userName;
    user.lastUsernameChange = new Date();
  }
  if (fullName) {
    user.fullName = fullName;
  }

  if (email) {
    user.email = email;
    user.isEmailVerified = false;
    const emailToken = await generateToken(user._id);
    user.verifyToken = emailToken;
    user.verifyTokenExpires = Date.now() + 30 * 60 * 1000;
    sendMail({
      email: user.email,
      subject: "Email Verification",
      text: `http://localhost:3000/api/v1/users/verify-email?token=${emailToken}`,
    });
  }

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
      },
      "User updated successfully. Please verify your email if it was changed otherwise you can't login"
    )
  );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const Token = req.cookies.refreshToken || req.body.refreshToken;

  if (!Token) {
    throw new ApiErrors(401, "You are not authenticated");
  }
  try {
    const decodedToken = await jwt.verify(Token, config.refreshTokenSecret);

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiErrors(401, "You are not authenticated or user not found");
    }

    if (Token !== user?.refreshToken) {
      throw new ApiErrors(401, "not matched");
    }

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
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
  } catch (error) {
    throw new ApiErrors(401, error?.message || "invalid token");
  }
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
    throw new ApiErrors(500, "Something went wrong while generating tokens");
  }
};

const generateToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const emailToken = await user.generateEmailToken();
    return emailToken;
  } catch (error) {
    throw new ApiErrors(500, "Something went wrong while generating tokens");
  }
};

const updateUserAvatar = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiErrors(400, "Invalid user id");
  }

  const user = await User.findById(userId).select("-password -refreshToken");
  const avatarPath = req.file?.path;

  if (!user) {
    unlinkPath(avatarPath, null);
    throw new ApiErrors(404, "User not found");
  }

  if (!avatarPath) {
    unlinkPath(avatarPath, null);
    throw new ApiErrors(400, "Avatar is required");
  }

  if (userId.toString() !== user._id.toString()) {
    unlinkPath(avatarPath, null);
    throw new ApiErrors(
      403,
      "You are not authorized to update this user avatar"
    );
  }

  const avatar = await uploadTOCloudinary(avatarPath, "user");

  if (!avatar) {
    throw new ApiErrors(500, "Something went wrong while uploading avatar");
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
    throw new ApiErrors(400, "Invalid user id");
  }

  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    unlinkPath(null, coverImagePath);
    throw new ApiErrors(404, "User not found");
  }

  if (!coverImagePath) {
    unlinkPath(null, coverImagePath);
    throw new ApiErrors(400, "Cover image is required");
  }

  if (userId.toString() !== user._id.toString()) {
    unlinkPath(null, coverImagePath);
    throw new ApiErrors(
      403,
      "You are not authorized to update this user cover image"
    );
  }

  const coverImage = await uploadTOCloudinary(coverImagePath, "user");

  if (!coverImage) {
    throw new ApiErrors(
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
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: req.user,
      },
      "User fetched successfully"
    )
  );
});

const verifyUserEmail = asyncHandler(async (req, res) => {
  const token = req.query?.token || req.body?.token;

  if (!token) {
    throw new ApiErrors(401, "Invalid token");
  }

  const user = await User.findOne({
    verifyToken: token,
    verifyTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiErrors(401, "Invalid token or token expired");
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
    throw new ApiErrors(400, "Please provide email");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiErrors(404, "User not found");
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
  ).select("-password -refreshToken");

  if (!userInfo) {
    throw new ApiErrors(404, "User not found");
  }

  sendMail({
    email: user.email,
    subject: "Email Verification",
    text: `http://localhost:3000/api/v1/users/verify-email?token=${emailToken}`,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        userInfo,
      },
      "Email verification sent successfully"
    )
  );
});

const sendForgotPasswordEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiErrors(400, "Please provide email");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiErrors(404, "User not found");
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
    throw new ApiErrors(404, "User not found");
  }

  sendMail({
    email: user.email,
    subject: "Reset Password",
    text: `http://localhost:3000/api/v1/users/reset-password?token=${forgotPasswordEmailToken}`,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        userInfo,
      },
      "Reset password email sent successfully"
    )
  );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword, token } = req.body;

  if (!newPassword || !token) {
    throw new ApiErrors(400, "Please provide new password and token");
  }

  const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new ApiErrors(401, "Invalid token or token expired");
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

  res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { user, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const githubOAuthCallback = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, options } = req.authInfo;
  const user = req.user;
  res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { user, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const getloginUserChannelProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiErrors(400, "Invalid user id");
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
    throw new ApiErrors(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, user[0], "User channel profile fetched successfully")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;

  if (!userName.trim()) {
    throw new ApiErrors(400, "Invalid username");
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
    throw new ApiErrors(404, "User not found");
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
    select: "title thumbnail videoFile duration views isPublished videoOwner",
    populate: {
      path: "videoOwner",
      select: "userName fullName avatar",
    },
  });

  if (!user) {
    throw new ApiErrors(404, "User not found");
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
};

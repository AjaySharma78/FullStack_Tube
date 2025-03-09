import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiErrors } from "../utils/apiError.js";
import config from "../env/config.js";
import { User } from "../models/user.model.js";

export const verifyUser = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies?.accessToken || req.headers["authorization"]?.split(" ")[1];
 
  if (!accessToken) {
    throw ApiErrors.unauthorized("You are not authenticated");
  }

  try {
    const decodedToken = jwt.verify(accessToken, config.accessTokenSecret);
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      throw ApiErrors.unauthorized("Invalid token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw ApiErrors.unauthorized("Invalid token");
  }
});
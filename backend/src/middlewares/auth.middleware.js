import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiErrors } from "../utils/apiError.js";
import config from "../env/config.js";
import {User} from "../models/user.model.js";

export const verifyUser = asyncHandler(async (req, _, next) => {
try {
        const accessToken = req.cookies?.accessToken || req.headers("Authorization")?.split(" ")[1];
        
        if(!accessToken){
            throw new ApiErrors(401, "You are not authenticated");
        }
        
        const decodedToken = await jwt.verify(accessToken,config.accessTokenSecret);
        const user =  await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiErrors(401, "You are not authenticated or user not");
        }
        req.user = user;
        next();
} catch (error) {
    throw new ApiErrors(401, "You are not authenticated or token is expired");
}
});
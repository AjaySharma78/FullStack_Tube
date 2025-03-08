import { ApiErrors } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import {
  uploadTOCloudinary,
  deleteFromCloudinary,
} from "../service/cloudinaryService.js";
import asyncHandler from "../utils/asyncHandler.js";
import fs from "fs";
import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Dislike } from "../models/dislike.model.js";
import { Comment } from "../models/comment.model.js";

function unlinkPath(videoPath, thumbnailPath) {
  if (videoPath) fs.unlinkSync(videoPath);
  if (thumbnailPath) fs.unlinkSync(thumbnailPath);
}

const createTweet = asyncHandler(async (req, res, next) => {
  const { text } = req.body;
  const userId = req.user?._id;

  const tweetData = {
    content: text,
    owner: userId,
  };

  const images = req.files?.images
    ? req.files.images.map((file) => file.path)
    : [];
  const videos = req.files?.videos
    ? req.files.videos.map((file) => file.path)
    : [];

  if (!text) {
    for (const img of images) {
      unlinkPath(null, img);
    }
    for (const vid of videos) {
      unlinkPath(vid, null);
    }
    throw new ApiErrors(400, "text is required");
  }

  if (images.length > 10) {
    for (const img of images) {
      unlinkPath(null, img);
    }
    throw new ApiErrors(400, "Cannot upload more than 10 images");
  }

  if (videos.length > 5) {
    for (const vid of videos) {
      unlinkPath(vid, null);
    }
    throw new ApiErrors(400, "Cannot upload more than 5 video");
  }

  if (images.length > 0) {
    const uploadedImages = [];
    try {
      for (const img of images) {
        const result = await uploadTOCloudinary(img, "tweet", "image");
        if (!result) {
          throw new ApiErrors(500, "Image upload failed");
        }
        uploadedImages.push(result.secure_url);
      }
      tweetData.images = uploadedImages;
    } catch (error) {
      for (const img of images) {
        unlinkPath(null, img);
      }
      throw new ApiErrors(500, "Image upload failed");
    }
  }

  if (videos.length > 0) {
    tweetData.videos = [];
    try {
      for (const vid of videos) {
        const result = await uploadTOCloudinary(vid, "tweet", "video");
        if (!result) {
          throw new ApiErrors(500, "Video upload failed");
        }
        tweetData.videos.push({
          video: result.playback_url,
          duration: result.duration,
        });
      }
    } catch (error) {
      for (const vid of videos) {
        unlinkPath(vid);
      }
      throw new ApiErrors(500, "Video upload failed");
    }
  }

  const tweet = await Tweet.create(tweetData);

  if (!tweet) {
    return next(ApiErrors.badRequest("Tweet not created"));
  }

  const createdTweet = await Tweet.aggregate([
    {
      $match: {
        _id: tweet._id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "dislikes",
        localField: "_id",
        foreignField: "tweet",
        as: "dislikes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        dislikesCount: { $size: "$dislikes" },
        tweetOwner: { $first: "$owner" },
      },
    },
    {
      $project: {
        content: 1,
        images: 1,
        videos: 1,
        createdAt: 1,
        likesCount: 1,
        dislikesCount: 1,
        tweetOwner: {
          userName: 1,
          fullName: 1,
          avatar: 1,
        },
      },
    },
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, createdTweet, "Tweet created successfully"));
});

const getUsertweets = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "dislikes",
        localField: "_id",
        foreignField: "tweet",
        as: "dislikes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        dislikesCount: { $size: "$dislikes" },
        tweetOwner: { $first: "$owner" },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $project: {
        content: 1,
        images: 1,
        videos: 1,
        createdAt: 1,
        likesCount: 1,
        dislikesCount: 1,
        tweetOwner: {
          userName: 1,
          fullName: 1,
          avatar: 1,
        },
      },
    },
  ]);

  if (!tweets || tweets.length === 0) {
    throw new ApiErrors(404, "No tweets found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const getTweetById = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiErrors(400, "tweetId is required");
  }

  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiErrors(400, "Invalid tweetId");
  }

  const tweet = await Tweet.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(`${tweetId}`),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "dislikes",
        localField: "_id",
        foreignField: "tweet",
        as: "dislikes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        dislikesCount: { $size: "$dislikes" },
        tweetOwner: { $first: "$owner" },
      },
    },
    {
      $project: {
        content: 1,
        images: 1,
        videos: 1,
        createdAt: 1,
        likesCount: 1,
        dislikesCount: 1,
        tweetOwner: {
          userName: 1,
          fullName: 1,
          avatar: 1,
        },
      },
    },
  ]);

  if (!tweet) {
    throw new ApiErrors(404, "No tweet found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet[0], "Tweet fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const userId = req.user?._id;
  const tweetId = req.params.tweetId;

  if (!text) {
    throw new ApiErrors(400, "text is required");
  }

  if (!tweetId) {
    throw new ApiErrors(400, "tweetId is required");
  }

  if (!userId) {
    throw new ApiErrors(400, "userId is required");
  }

  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiErrors(400, "Invalid userId");
  }

  const tweet = await Tweet.findById(tweetId);

  if (userId.toString() !== tweet.owner.toString()) {
    throw new ApiErrors(400, "You are not authorized to update this tweet");
  }

  const updateTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content: text },
    { new: true }
  ).populate("owner", "userName fullName avatar");

  if (!tweet) {
    throw new ApiErrors(400, "Tweet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updateTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const tweetId = req.params.tweetId;

  if (!tweetId) {
    throw new ApiErrors(400, "tweetId is required");
  }

  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiErrors(400, "Invalid userId");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiErrors(400, "Tweet not found");
  }

  if (userId.toString() !== tweet.owner.toString()) {
    throw new ApiErrors(400, "You are not authorized to delete this tweet");
  }

  const deleteTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deleteTweet) {
    throw new ApiErrors(400, "Tweet not found");
  }

  if (deleteTweet.images.length > 0) {
    for (const img of deleteTweet.images) {
      const imagePublicId = img.split("/").pop().split(".")[0];
      await deleteFromCloudinary(imagePublicId, "tweet");
    }
  }

  if (deleteTweet.videos.length > 0) {
    for (const vid of deleteTweet.videos) {
      const videoPublicId = vid.video.split("/").pop().split(".")[0];
      await deleteFromCloudinary(videoPublicId, "tweet", "video");
    }
  }

  const comments = await Comment.find({ tweet: tweetId });
  const commentIds = comments.map((comment) => comment._id);

  await Promise.all([
    Like.deleteMany({ comment: { $in: commentIds } }),
    Dislike.deleteMany({ comment: { $in: commentIds } }),
    Like.deleteMany({ tweet: tweetId }),
    Dislike.deleteMany({ tweet: tweetId }),
    Comment.deleteMany({ tweet: tweetId }),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});


const allTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "dislikes",
        localField: "_id",
        foreignField: "tweet",
        as: "dislikes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        dislikesCount: { $size: "$dislikes" },
        tweetOwner: { $first: "$owner" },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $project: {
        _id:1,
        content: 1,
        images: 1,
        videos: 1,
        createdAt: 1,
        likesCount: 1,
        dislikesCount: 1,
        tweetOwner: {
          _id:1,
          userName: 1,
          fullName: 1,
          avatar: 1,
        },
      },
    },
  ]);

  if (!tweets || tweets.length === 0) {
    throw new ApiErrors(404, "No tweets found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
})
export { createTweet, getUsertweets, updateTweet, deleteTweet, getTweetById,allTweets };

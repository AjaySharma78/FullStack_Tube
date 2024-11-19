import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiErrors } from "../utils/apiError.js";
import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Dislike } from "../models/dislike.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiErrors(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiErrors(404, "Video not found");
  }

  const userId = req.user?._id;

  const like = await Like.findOne({ video: videoId, likedBy: userId });

  if (!like) {
    await Dislike.findOneAndDelete({ video: videoId, dislikedBy: userId });
    const liked = await Like.create({ video: videoId, likedBy: userId });
    return res
      .status(201)
      .json(new ApiResponse(201, liked, "Video liked successfully"));
  } else {
    await Like.findByIdAndDelete(like._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Video unliked successfully"));
  }
});

const toggleVideoCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiErrors(400, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiErrors(404, "Video comment not found");
  }

  const userId = req.user?._id;

  const like = await Like.findOne({ comment: commentId, likedBy: userId });

  if (!like) {
    await Dislike.findOneAndDelete({ comment: commentId, dislikedBy: userId });
    const liked = await Like.create({ comment: commentId, likedBy: userId });
    return res
      .status(201)
      .json(new ApiResponse(201, liked, "Video comment liked successfully"));
  } else {
    await Like.findByIdAndDelete(like._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Video comment unliked successfully"));
  }
});

const toggleTweetCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiErrors(400, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiErrors(404, "comment not found");
  }

  const userId = req.user?._id;

  const like = await Like.findOne({ comment: commentId, likedBy: userId });

  if (!like) {
    await Dislike.findOneAndDelete({ comment: commentId, dislikedBy: userId });
    const liked = await Like.create({ comment: commentId, likedBy: userId });
    return res
      .status(201)
      .json(new ApiResponse(201, liked, "Tweet comment liked successfully"));
  } else {
    await Like.findByIdAndDelete(like._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet comment unliked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiErrors(400, "Invalid tweetId");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiErrors(404, "Tweet not found");
  }

  const userId = req.user?._id;

  const like = await Like.findOne({ tweet: tweetId, likedBy: userId });

  if (!like) {
    await Dislike.findOneAndDelete({ tweet: tweetId, dislikedBy: userId });
    const liked = await Like.create({ tweet: tweetId, likedBy: userId });
    return res
      .status(201)
      .json(new ApiResponse(201, liked, "Tweet liked successfully"));
  } else {
    await Like.findByIdAndDelete(like._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet unliked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const likedVideos = await Like.aggregate([
    {
      $match: { likedBy: userId },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "videoOwner",
              foreignField: "_id",
              as: "videoOwner",
            },
          },
          {
            $unwind: "$videoOwner",
          },
        ],
      },
    },
    {
      $unwind: "$video",
    },
    {
      $project: {
        title: "$video.title",
        thumbnail: "$video.thumbnail",
        videoFile: "$video.videoFile",
        duration: "$video.duration",
        views: "$video.views",
        isPublished: "$video.isPublished",
        videoOwner: {
          userName: "$video.videoOwner.userName",
          fullName: "$video.videoOwner.fullName",
          avatar: "$video.videoOwner.avatar",
        },
        createdAt: "$video.createdAt",
        updatedAt: "$video.updatedAt",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, likedVideos.length===0? "No liked videos found" : "Liked videos retrieved successfully")
    );
});

export { toggleVideoLike, getLikedVideos, toggleVideoCommentLike , toggleTweetLike, toggleTweetCommentLike};

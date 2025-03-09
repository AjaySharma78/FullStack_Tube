import asyncHandler from "../utils/asyncHandler.js";
import fs from "fs";
import {
  uploadTOCloudinary,
  deleteFromCloudinary,
} from "../service/cloudinaryService.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiErrors } from "../utils/apiError.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { Dislike } from "../models/dislike.model.js";


function unlinkPath(videoPath, thumbnailPath) {
  if (videoPath) fs.unlinkSync(videoPath);
  if (thumbnailPath) fs.unlinkSync(thumbnailPath);
}

const createVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;
  
  if (!req.files || !req.files.thumbnail || !req.files.video) {
    unlinkPath(req.files?.video[0].path, req.files?.thumbnail[0].path);
    throw new ApiErrors(400, "Please upload video and thumbnail");
  }
  
  const thumbnail = req.files?.thumbnail[0].path;
  const video = req.files?.video[0].path;
  
  if (!title || !description || !isPublished) {
    unlinkPath(video, thumbnail);
    throw new ApiErrors(400, "Please provide title, description and isPublished");
  }

  const [thumbnailUpload, videoUpload] = await Promise.all([
    await uploadTOCloudinary(thumbnail, "video", "image"),
    await uploadTOCloudinary(video, "video", "video")
  ])

  if (!thumbnailUpload || !videoUpload) {
    throw new ApiErrors(500, "Something went wrong while uploading files");
  }
  
  const newVideo = await Video.create({
    title,
    description,
    thumbnail: thumbnailUpload?.secure_url,
    videoFile: videoUpload?.secure_url,
    videoFileMpeg: videoUpload?.playback_url,
    duration: videoUpload?.duration,
    videoOwner: req.user?._id,
    isPublished,
  });

  if (!newVideo) {
    throw new ApiErrors(500, "Something went wrong while creating video");
  }

  await User.updateOne(
    { _id: req.user?._id },
    { $push: { videos: { $each: [newVideo._id], $position: 0 } } }
  );

  const createdVideo = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(`${newVideo._id}`),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "videoOwner",
        foreignField: "_id",
        as: "ownerInfo",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscriberCount: { $size: "$subscribers" },
              isSubscribed: {
                $cond: {
                  if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                  then: true,
                  else: false,
                },
              },
            },
          },
        ],
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
        numberoflikes: { $size: "$likes" },
        numberofdislikes: { $size: "$dislikes" },
        videoOwner: { $first: "$ownerInfo" },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
        isDisliked: {
          $cond: {
            if: { $in: [req.user?._id, "$dislikes.dislikedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        numberoflikes: 1,
        numberofdislikes: 1,
        isLiked: 1,
        isDisliked: 1,
        createdAt: 1,
        videoOwner: {
          _id: 1,
          userName: 1,
          fullName: 1,
          avatar: 1,
          subscriberCount: 1,
          isSubscribed: 1,
        },
      },
    },
  ]);

  if (!createdVideo) {
    throw new ApiErrors(500, "Something went wrong while creating video");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdVideo[0], "Video uploaded successfully"));
});

const getVideos = asyncHandler(async (req, res) => {
  const {
    pageNumber = 1,
    limitNumber = 100,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pipeline = [];
  const limit = Number(limitNumber);
  const page = Number(pageNumber);
  const skip = (page - 1) * limit;
  if (query && query.trim() !== "") {
    pipeline.push({
      $search: {
        index: "default",
        text: {
          query: query,
          path: ["title", "description"],
          fuzzy: {
            maxEdits: 2,
            prefixLength: 3,
          },
        },
      },
    });
  }

  if (userId) {
    if (userId === "" && !isValidObjectId(userId)) {
      throw new ApiErrors(400, "Invalid user");
    }

    pipeline.push({
      $match: {
        videoOwner: new mongoose.Types.ObjectId(`${userId}`),
      },
    });
  }

  pipeline.push(
    {
      $match: {
        isPublished: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "videoOwner",
        foreignField: "_id",
        as: "videoOwner",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "dislikes",
        localField: "_id",
        foreignField: "video",
        as: "dislikes",
      },
    },
    {
      $addFields: {
        videoOwner: { $first: "$videoOwner" },
        likes: { $size: "$likes" },
        dislikes: { $size: "$dislikes" },
      },
    },
    {
      $facet: {
        metadata: [{ $count: "totalItems" }],
        data: [
          { $sort: { [sortBy]: sortType === "asc" ? 1 : -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              videoOwner: {
                userName: 1,
                fullName: 1,
                email: 1,
                avatar: 1,
              },
              title: 1,
              description: 1,
              thumbnail: 1,
              videoFile: 1,
              videoFileMpeg: 1,
              duration: 1,
              isPublished: 1,
              createdAt: 1,
              likes: 1,
              dislikes: 1,
              views: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalItems: { $arrayElemAt: ["$metadata.totalItems", 0] },
      },
    }
  );
  const videoInfo = await Video.aggregate(pipeline);

  if (videoInfo[0]?.data?.length === 0) {
    return res.status(404).json(new ApiResponse(404, [], "No videos found"));
  }

  const totalItems = videoInfo[0].totalItems;
  const totalPages = Math.ceil(totalItems / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videoInfo: videoInfo[0].data,
        totalItems,
        totalPages,
        limit: limit,
        page: page,
        next: page < totalPages ? Number(page) + 1 : null,
        prev: page > 1 ? page - 1 : null,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
      "Videos fetched successfully"
    )
  );
});

const getUserVideos = asyncHandler(async (req, res) => {
  const {
    pageNumber = 1,
    limitNumber = 100,
    query,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;

  const pipeline = [];

  const limit = Number(limitNumber);
  const page = Number(pageNumber);
  const skip = (page - 1) * limit;

  if (query && query.trim() !== "") {
    pipeline.push({
      $search: {
        index: "default",
        text: {
          query: query,
          path: ["title", "description"],
          fuzzy: {
            maxEdits: 2,
            prefixLength: 3,
          },
        },
      },
    });
  }

  pipeline.push(
    {
      $match: {
        videoOwner: new mongoose.Types.ObjectId(`${req.user?._id}`),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "videoOwner",
        foreignField: "_id",
        as: "videoOwner",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "dislikes",
        localField: "_id",
        foreignField: "video",
        as: "dislikes",
      },
    },
    {
      $addFields: {
        videoOwner: { $first: "$videoOwner" },
        likes: { $size: "$likes" },
        dislikes: { $size: "$dislikes" },
      },
    },
    {
      $facet: {
        metadata: [{ $count: "totalItems" }],
        data: [
          { $sort: { [sortBy]: sortType === "asc" ? 1 : -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              videoOwner: {
                userName: 1,
                fullName: 1,
                email: 1,
                avatar: 1,
              },
              title: 1,
              description: 1,
              thumbnail: 1,
              videoFile: 1,
              videoFileMpeg: 1,
              duration: 1,
              isPublished: 1,
              createdAt: 1,
              likes: 1,
              dislikes: 1,
              views: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalItems: { $arrayElemAt: ["$metadata.totalItems", 0] },
      },
    }
  );
  const videoInfo = await Video.aggregate(pipeline);

  if (videoInfo[0]?.data?.length === 0) {
    return res.status(404).json(new ApiResponse(404, [], "No videos found"));
  }

  const totalItems = videoInfo[0].totalItems;
  const totalPages = Math.ceil(totalItems / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videoInfo: videoInfo[0].data,
        totalItems,
        totalPages,
        limit: limit,
        page: page,
        next: page < totalPages ? Number(page) + 1 : null,
        prev: page > 1 ? page - 1 : null,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
      "Videos fetched successfully"
    )
  );
});

const getVideo = asyncHandler(async (req, res) => {
  const { videoId, userId } = req.params;
 
  if (!isValidObjectId(videoId)) {
    throw new ApiErrors(400, "Invalid videoId");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(`${videoId}`),
        
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "liked",
      },
    },
    {
      $lookup: {
        from: "dislikes",
        localField: "_id",
        foreignField: "video",
        as: "disliked",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "videoOwner",
        foreignField: "_id",
        as: "ownerInfo",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscriberCount: { $size: "$subscribers" },
              isSubscribed: {
                $cond: {
                  if: { $in: [(userId == 'null' || userId==':userId')? userId:new mongoose.Types.ObjectId(`${userId}`),"$subscribers.subscriber"] },
                  then: true,
                  else: false,
                },
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        numberoflikes: { $size: "$liked" },
        videoOwner: { $first: "$ownerInfo" },
        numberofdislike: { $size: "$disliked" },
        isLiked: {
          $cond: {
            if: { $in: [(userId == 'null' || userId==':userId')? userId : new mongoose.Types.ObjectId(`${userId}`), "$liked.likedBy"] },
            then: true,
            else: false,
          },
        },
        isDisliked: {
          $cond: {
            if: { $in: [(userId == 'null' || userId==':userId')? userId : new mongoose.Types.ObjectId(`${userId}`), "$disliked.dislikedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        videoFileMpeg: 1,
        numberoflikes: 1,
        numberofdislike: 1,
        isLiked: 1,
        isDisliked: 1,
        createdAt: 1,
        videoOwner: {
          _id: 1,
          userName: 1,
          fullName: 1,
          avatar: 1,
          subscriberCount: 1,
          isSubscribed: 1,
        },
      },
    },
  ]);

  if (!video) {
    throw new ApiErrors(404, "Video not found");
  }

  // Add video to watch history of user if user is logged in
  if (userId && isValidObjectId(userId)) {
    const user = await User.findById(userId);
    if (user && !user.watchHistory.includes(videoId)) {
      await User.findByIdAndUpdate(userId, {
        $push: { watchHistory: { $each: [videoId], $position: 0 } },
      });
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

const updateVideoTitledescription = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const userId = req.user?._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiErrors(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);
  if (video.videoOwner.toString() !== userId.toString()) {
    throw new ApiErrors(
      403,
      "You are not owner of this video to update title and description"
    );
  }

  if (!video) {
    throw new ApiErrors(404, "Video not found");
  }

  if (!title) {
    throw new ApiErrors(400, "Please provide title");
  }

  if (description) {
    video.description = description;
  }

  video.title = title;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiErrors(400, "Invalid videoId");
  }

  const videoinfo = await Video.findById(videoId);
  if (videoinfo.videoOwner.toString() !== userId.toString()) {
    throw new ApiErrors(403, "You are not owner of this video to delete");
  }
  const video = await Video.findByIdAndDelete(videoId);
  if (!video) {
    throw new ApiErrors(404, "Video not found");
  }

  const thumbnailDelete = video.thumbnail;
  const videoDelete = video.videoFile;

  if (videoDelete && thumbnailDelete) {
    const videoPublicId = videoDelete.split("/").pop().split(".")[0];
    const thumbnailPublicId = thumbnailDelete.split("/").pop().split(".")[0];
    await Promise.all([
      deleteFromCloudinary(videoPublicId, "video", "video"),
      deleteFromCloudinary(thumbnailPublicId, "video"),
    ]);
  }
  const comments = await Comment.find({ video: videoId });
  const commentIds = comments.map((comment) => comment._id);

  await Promise.all([
    Like.deleteMany({ comment: { $in: commentIds } }),
    Dislike.deleteMany({ comment: { $in: commentIds } }),
    Like.deleteMany({ video: videoId }),
    Dislike.deleteMany({ video: videoId }),
    Comment.deleteMany({ video: videoId }),
    User.updateMany(
      { watchHistory: videoId },
      { $pull: { watchHistory: videoId } }
    ),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, [], "Video deleted successfully"));
});

const toggleVideoStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiErrors(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiErrors(404, "Video not found");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, `Video ${video.isPublished ? "published" : "unpublished"} successfully`));
});

const updateVideoThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const thumbnail = req.file?.path;
  const userId = req.user?._id;

  if (!isValidObjectId(videoId)) {
    unlinkPath(null, thumbnail);
    throw new ApiErrors(400, "Invalid videoId");
  }

  if (!req.file || !thumbnail) {
    unlinkPath(null, thumbnail);
    throw new ApiErrors(400, "Please provide thumbnail to update");
  }

  const video = await Video.findById(videoId);

  if (video.videoOwner.toString() !== userId.toString()) {
    unlinkPath(null, thumbnail);
    throw new ApiErrors(
      403,
      "You are not owner of this video to update thumbnail"
    );
  }

  if (!video) {
    unlinkPath(null, thumbnail);
    throw new ApiErrors(404, "Video not found");
  }

  const thumbnailUpload = await uploadTOCloudinary(thumbnail, "video","image");

  if (!thumbnailUpload) {
    unlinkPath(null, thumbnail);
    throw new ApiErrors(500, "Something went wrong while uploading thumbnail");
  }

  const oldThumbnail = video.thumbnail;
  if (oldThumbnail) {
    const oldThumbnailpublicId = oldThumbnail.split("/").pop().split(".")[0];
    const deletedThumbnail = await deleteFromCloudinary(
      oldThumbnailpublicId,
      "video"
    );
    if (!deletedThumbnail) {
      throw new ApiErrors(
        500,
        "Something went wrong while deleting old thumbnail"
      );
    }
  }
  video.thumbnail = thumbnailUpload.secure_url;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Thumbnail updated successfully"));
});

const incrementViewCount = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiErrors(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiErrors(404, "Video not found");
  }

  video.views += 1;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "View count incremented successfully"));
});

const searchVideoTitles = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query || query.trim() === "") {
    throw new ApiErrors(400, "Please provide a search query");
  }

  const pipeline = [
    {
      $search: {
        index: "default",
        text: {
          query: query,
          path: ["title", "description"],
          fuzzy: {
            maxEdits: 2,
            prefixLength: 3,
          },
        },
      },
    },
    {
      $match: {
        isPublished: true,
      },
    },
    {
      $project: {
        title: 1,
      },
    },
  ];

  const videoTitles = await Video.aggregate(pipeline);

  if (videoTitles.length === 0) {
    return res.status(404).json(new ApiResponse(404, [], "No videos found"));
  }

  return res.status(200).json(new ApiResponse(200, videoTitles, "Titles fetched successfully"));
});

export {
  getVideos,
  getVideo,
  createVideo,
  updateVideoTitledescription,
  deleteVideo,
  toggleVideoStatus,
  updateVideoThumbnail,
  incrementViewCount,
  getUserVideos,
  searchVideoTitles
};

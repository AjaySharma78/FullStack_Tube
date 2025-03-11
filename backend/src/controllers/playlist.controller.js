import { ApiResponse } from "../utils/apiResponse.js";
import { ApiErrors } from "../utils/apiError.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiErrors(400, "Name is required");
  }
  let ifdescription;

  if (description) {
    ifdescription = description;
  }

  const playlist = await Playlist.create({
    name,
    description: ifdescription ? ifdescription : "",
    owner: req.user?._id,
  });

  if (!playlist) {
    throw new ApiErrors(500, "Failed to create playlist");
  }

  const playlistInfo = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(`${playlist._id}`),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "playlistVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "videoOwner",
              foreignField: "_id",
              as: "videoOwnerInfo",
              pipeline: [
                {
                  $project: {
                    userName: 1,
                    fullName: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$videoOwnerInfo",
          },
        ],
      },
    },
    {
      $addFields: {
        numberOfVideos: { $size: "$playlistVideos" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "playlistOwner",
      },
    },
    {
      $unwind: "$playlistOwner",
    },
    {
      $project: {
        name: 1,
        description: 1,
        owner: 1,
        playlistVideos: 1,
        numberOfVideos: 1,
        playlistOwner: {
          userName: 1,
          fullName: 1,
        },
      },
    },
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, playlistInfo, "Playlist created successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.body;

  if (!videoId) {
    throw new ApiErrors(400, "PlaylistId and videoId is required");
  }

  let playlist;

  if (!playlistId || playlistId === "undefined") {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiErrors(404, "Video not found");
    }

    if(!video.isPublished) {
      throw new ApiErrors(400, "Video is not published");
    }

    playlist = await Playlist.create({
      name: video.title || "New Playlist",
      description: video.description || "",
      owner: req.user?._id,
      video: [videoId],
    });

    if (!playlist) {
      throw new ApiErrors(500, "Failed to create playlist");
    }
  } else {
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new ApiErrors(400, "Invalid videoId");
    }

    playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new ApiErrors(404, "Playlist not found");
    }

    const userId = req.user?._id;

    if (userId.toString() !== playlist.owner.toString()) {
      throw new ApiErrors(
        403,
        "You are not authorized to add video in playlist"
      );
    }
    const video = await Video.findById(videoId);
    
    if (!video) {
      throw new ApiErrors(404, "Video not found");
    }

    if(!video.isPublished) {
      throw new ApiErrors(400, "Video is not published");
    }

    if (!playlist.video.includes(videoId)) {
      playlist.video.push(videoId);
      await playlist.save();
    }else{
      return res
      .status(400)
      .json(new ApiResponse(400, null, "Video already added to playlist"));
    }
  }



  const playlistInfo = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(`${playlist._id}`),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "playlistVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "videoOwner",
              foreignField: "_id",
              as: "videoOwnerInfo",
              pipeline: [
                {
                  $project: {
                    userName: 1,
                    fullName: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$videoOwnerInfo",
          },
        ],
      },
    },
    {
      $addFields: {
        numberOfVideos: { $size: "$playlistVideos" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "playlistOwner",
      },
    },
    {
      $unwind: "$playlistOwner",
    },
    {
      $project: {
        name: 1,
        description: 1,
        owner: 1,
        playlistVideos: 1,
        numberOfVideos: 1,
        playlistOwner: {
          userName: 1,
          fullName: 1,
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlistInfo[0],
        playlistId ? "Video added to playlist successfully" :
        "Playlist created and video added successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.body;

  if (!playlistId || !videoId) {
    throw new ApiErrors(400, "PlaylistId and videoId is required");
  }

  const isplaylist = await Playlist.findById(playlistId);

  const userId = req.user?._id;

  if (userId.toString() !== isplaylist.owner.toString()) {
    throw new ApiErrors(403, "You are not authorized to add video in playlist");
  }

  if (!isplaylist) {
    throw new ApiErrors(404, "Playlist not found");
  }

  if (!isplaylist.video.includes(videoId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Video not found in the playlist"));
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { video: videoId },
    },
    {
      new: true,
    }
  );

  if (!playlist) {
    throw new ApiErrors(404, "Playlist not found cannot remove video");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const removeAllVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiErrors(400, "PlaylistId is required");
  }
  const isplaylist = await Playlist.findById(playlistId);

  const userId = req.user?._id;

  if (userId.toString() !== isplaylist.owner.toString()) {
    throw new ApiErrors(403, "You are not authorized to add video in playlist");
  }

  const playlist = await Playlist.findByIdAndUpdate(playlistId, {
    $set: { video: [] },
    new: true,
  });

  if (!playlist) {
    throw new ApiErrors(404, "Playlist not found cannot remove video");
  }

  const playlistInfo = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(`${playlist._id}`),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "playlistVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "videoOwner",
              foreignField: "_id",
              as: "videoOwnerInfo",
              pipeline: [
                {
                  $project: {
                    userName: 1,
                    fullName: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$videoOwnerInfo",
          },
        ],
      },
    },
    {
      $addFields: {
        numberOfVideos: { $size: "$playlistVideos" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "playlistOwner",
      },
    },
    {
      $unwind: "$playlistOwner",
    },
    {
      $project: {
        name: 1,
        description: 1,
        owner: 1,
        playlistVideos: 1,
        numberOfVideos: 1,
        playlistOwner: {
          userName: 1,
          fullName: 1,
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlistInfo[0],
        "All Videos removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiErrors(400, "PlaylistId is required");
  }

  const playlist = await Playlist.findByIdAndDelete(playlistId);

  if (!playlist) {
    throw new ApiErrors(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist deleted successfully"));
})

const getUserPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiErrors(400, "UserId is required");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(`${userId}`),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "playlistVideos",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "playlistOwner",
      },
    },
    {
      $unwind: "$playlistOwner",
    },
    {
      $addFields: {
        numberOfVideos: { $size: "$playlistVideos" },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        numberOfVideos: 1,
        playlistVideos: 1,
        playlistOwner: {
          userName: 1,
          fullName: 1,
          _id: 1,
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!playlist) {
    throw new ApiErrors(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

export {
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  removeAllVideoFromPlaylist,
  getUserPlaylist,
  deletePlaylist
};

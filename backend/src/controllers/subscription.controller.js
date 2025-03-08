import { ApiErrors } from "../utils/apiError.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";

const toggleSubscribe = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriber = req.user?.id;
  const subscription = await Subscription.findOne({
    subscriber,
    channel: channelId,
  });

  if (subscription) {
    const Unsubscribed = await Subscription.findByIdAndDelete(subscription._id)
      .populate("channel", "userName fullName")
      .populate("subscriber", "userName fullName");
    if (!Unsubscribed) {
      throw new ApiErrors(400, "Subscription not deleted");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, Unsubscribed,"Unsubscribed successfully"));
  }

  const subscribed = await Subscription.create({
    subscriber,
    channel: channelId,
  });
  const subscribedChannel = await Subscription.findById(subscribed._id)
    .populate("channel", "userName fullName")
    .populate("subscriber", "userName fullName");

  if (!subscribedChannel) {
    throw new ApiErrors(400, "Subscription not created");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, subscribedChannel,"Subscribed successfully"));
});

const subscription = asyncHandler(async (req, res) => {
  const subscriber = req.user?.id;

  if (!subscriber) {
    throw new ApiErrors(400, "Invalid subscriber");
  }

  const subscriptions = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(`${subscriber}`),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannelInfo",
        pipeline: [
          {
            $project: {
              userName: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "channel",
        foreignField: "videoOwner",
        as: "subscribdedChannelsVideos",
        pipeline: [
          {
            $limit: 5,
          },
          {
            $sort: { createdAt: -1 },
          },
          {
            $project: {
              title: 1,
              videoFile: 1,
              thumbnail: 1,
              description: 1,
              duration: 1,
              views: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscribdedChannelsVideos",
      $unwind: "$subscribedChannelInfo",
    },
    {
      $project: {
        subscribedChannelInfo: 1,
        subscribdedChannelsVideos: 1,
      },
    },
  ]);

  if (!subscriptions) {
    throw new ApiErrors(400, "No subscriptions found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriptions,
        subscriptions.length === 0
          ? "No Subscriptions found"
          : "Subscriptions found"
      )
    );
});

const getSubscribers = asyncHandler(async (req, res) => {
  const channelId = req.user?._id;
  const subscribers = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(`${channelId}`) },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
        pipeline: [
          {
            $project: {
              userName: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "subscriber",
        foreignField: "channel",
        as: "subscribersubscriptions",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribersubscriptions" },
      },
    },
    {
      $unwind: "$subscribers",
    },
    {
      $project: {
        subscribers: 1,
        subscribersCount: 1,
      },
    },
  ]);

  if (!subscribers) {
    throw new ApiErrors(400, "No subscribers found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        subscribers.length === 0 ? "No Subscribers found" : "Subscribers found"
      )
    );
});

const subscribedChannel = asyncHandler(async (req, res) => {
  const subscriber = req.user?.id;

  if (!subscriber) {
    throw new ApiErrors(400, "Invalid subscriber");
  }

  const subscriptions = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(`${subscriber}`),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannelInfo",
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
              subscribersCount: { $size: "$subscribers" },
              isSubscribed: true,
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscribedChannelInfo",
    },
    {
      $project: {
        subscribedChannelInfo: {
          _id: 1,
          userName: 1,
          fullName: 1,
          avatar: 1,
          subscribersCount: 1,
          isSubscribed: 1,
        },
      },
    },
  ]);

  if (!subscriptions) {
    throw new ApiErrors(400, "No subscriptions found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriptions,
        subscriptions.length == 0
          ? "No Subscribed Channel found"
          : "Subscribed Channel found"
      )
    );
});

export { toggleSubscribe, subscription, getSubscribers, subscribedChannel };

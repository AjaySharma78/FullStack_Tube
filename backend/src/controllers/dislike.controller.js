import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiErrors } from "../utils/apiError.js";
import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Dislike } from "../models/dislike.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoDisLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiErrors(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiErrors(404, "Video not found");
  }

  const userId = req.user?._id;

  const dislike = await Dislike.findOne({ video: videoId, dislikedBy: userId });

  if (!dislike) {
    await Like.findOneAndDelete({ video: videoId, likedBy: userId });
    const disLiked = await Dislike.create({
      video: videoId,
      dislikedBy: userId,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, disLiked, "Video Disliked successfully"));
  } else {
    await Dislike.findByIdAndDelete(dislike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Video unliked successfully"));
  }
});

const toggleVideoCommentDisLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiErrors(400, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiErrors(404, "Comment not found");
  }

  const userId = req.user?._id;

  const dislike = await Dislike.findOne({ comment: commentId, dislikedBy: userId });

  if (!dislike) {
    await Like.findOneAndDelete({ comment: commentId, likedBy: userId });
    const disLiked = await Dislike.create({
      comment: commentId,
      dislikedBy: userId,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, disLiked, "Video Disliked successfully"));
  } else {
    await Dislike.findByIdAndDelete(dislike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Video unliked successfully"));
  }
});

const toggleTweetDislike = asyncHandler(async (req, res) => {

  const {tweetId} = req.params;

  if(!isValidObjectId(tweetId)){
    throw new ApiErrors(400,"Invalid tweetId");
  }

  const tweet = await Tweet.findById(tweetId);

  if(!tweet){
    throw new ApiErrors(404,"Tweet not found");
  }

  const userId = req.user?._id;

  const dislike = await Dislike.findOne({tweet:tweetId,dislikedBy:userId});

  if(!dislike){
    await Like.findOneAndDelete({tweet:tweetId,likedBy:userId});
    const disLiked = await Dislike.create({tweet:tweetId,dislikedBy:userId});
    return res.status(201).json(new ApiResponse(201,disLiked,"Tweet Disliked successfully"));
  }else{
    await Dislike.findByIdAndDelete(dislike._id);
    return res.status(200).json(new ApiResponse(200,null,"Tweet unliked successfully"));
  }

})

const toggleTweetCommentDislike = asyncHandler(async(req,res)=>{
     
  const { commentId }  = req.params;

  if(!isValidObjectId(commentId)){
    throw new ApiErrors(400,"Invalid CommentId")
  }

  const comment = await Comment.findById(commentId);

  if(!comment){
    throw new ApiErrors(404,"Video comment not found");
  }

  const userId = req.user?._id;

  const dislike = await Dislike.findOne({comment:commentId, dislikedBy:userId});

  if(!dislike){
    await Like.findOneAndDelete({comment:commentId,likedBy:userId});
    const disliked = await Dislike.create({comment:commentId,dislikedBy:userId});
    return res.status(201).json(new ApiResponse(201,disliked,"Video comment disliked successfully"));
  }else{
    await Dislike.findByIdAndDelete(dislike._id);
    return res.status(200).json(new ApiResponse(200,null,"Video comment unliked successfully"));
  }
})
export { toggleVideoDisLike , toggleVideoCommentDisLike , toggleTweetDislike, toggleTweetCommentDislike};

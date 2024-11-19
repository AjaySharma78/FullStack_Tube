import { ApiResponse } from "../utils/apiResponse.js";
import { ApiErrors } from "../utils/apiError.js";
import mongoose, { isValidObjectId } from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Dislike } from "../models/dislike.model.js";

const createVideoComment = asyncHandler(async (req,res)=>{

    const {videoId} = req.params;
    const {content} = req.body;
    

    if(!isValidObjectId(videoId)){
        throw new ApiErrors(400,"Invalid video id");
    }

    const comment = await Comment.create({
        content,
        video:videoId,
        commentOwner:req.user?._id
    })
   
    if(!comment){
        throw new ApiErrors(400,"Comment not created");
    }


    const commentInfo = await Comment.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(`${comment._id}`)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"commentOwner",
                foreignField:"_id",
                as:"commentOwner",
                pipeline:[
                    {
                        $lookup:{
                            from:"likes",
                            localField:"_id",
                            foreignField:"comment",
                            as:"likes"
                        }
                    },
                    {
                         $lookup:{
                            from:"dislikes",
                            localField:"_id",
                            foreignField:"comment",
                            as:"dislikes"
                         }
                    },
                    {
                        $addFields:{
                            likesCount:{$size:"$likes"},
                            dislikesCount:{$size:"$dislikes"}
                        }
                    }
                ]

            }
        },
        {
            $unwind:"$commentOwner"
        },
        {
           $project:{
                content:1,
                createdAt:1,
                commentOwner:{
                     fullName:1,
                     userName:1,
                     avatar:1,
                     likesCount:1,
                     dislikesCount:1
                },
                createdAt:1
                
           }
        },
       
    ])
    
    if (!commentInfo) {
        throw new ApiErrors(400,"Comment not created");
        
    }


    return res.status(201).json(new ApiResponse(201,commentInfo[0],"Comment created successfully"));
})

const getVideoComments = asyncHandler(async (req,res)=>{

    const {videoId} = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiErrors(400,"Invalid video id or please provide a valid video id");
    }

    const comments = await Comment.aggregate([
          {
                $match:{video:new mongoose.Types.ObjectId(`${videoId}`)}
          },
          {
               $lookup:{
                   from:"users",
                   localField:"commentOwner",
                   foreignField:"_id",
                   as:"commentOwner",
               }
          },
          {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"comment",
                as:"likes",
            }
          },
          {
            $lookup:{
                from:"dislikes",
                localField:"_id",
                foreignField:"comment",
                as:"dislikes",
            }
          },
            {
                $addFields:{
                    likesCount:{$size:"$likes"},
                    dislikesCount:{$size:"$dislikes"}
                }
            },
            {
                $unwind:"$commentOwner"
            },
            {
                $project:{
                    content:1,
                    createdAt:1,
                    commentOwner:{
                        fullName:1,
                        userName:1,
                        avatar:1,
                    },
                    likesCount:1,
                    dislikesCount:1
                }
            }
          
    ])
    
    if (!comments) {
        throw new ApiErrors(400,"Comments not found");
    }

    if(comments.length === 0){
        return res.status(200).json(new ApiResponse(200,[],"No comments found"));
    }

    return res.status(200).json(new ApiResponse(200,comments,"Comments fetched successfully"));
})

const updateVideoComment = asyncHandler(async (req,res)=>{
    const {commentId} = req.params;
    const {content} = req.body;
    const userId = req.user?._id;

    if(!content){
        throw new ApiErrors(400,"Content is required");
    }

    if(!isValidObjectId(commentId)){
        throw new ApiErrors(400,"Invalid comment id");
    }

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiErrors(400,"Comment not found");
    }

    if(comment.commentOwner.toString() !== userId.toString()){
        throw new ApiErrors(401,"You are not authorized to update this comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {content},
        {new:true}
    );

    return res.status(200).json(new ApiResponse(200,updatedComment,"Comment updated successfully"));
})

const deletedVideoComment = asyncHandler(async (req,res)=>{
    const {commentId} = req.params;
    const userId = req.user?._id;

    if(!isValidObjectId(commentId)){
        throw new ApiErrors(400,"Invalid comment id");
    }
    
    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiErrors(400,"Comment not found");
    }

    if(comment.commentOwner.toString() !== userId.toString()){
        throw new ApiErrors(401,"You are not authorized to delete this comment");
    }

    const deletedcomment = await Comment.findByIdAndDelete(commentId);

    if(!deletedcomment){
        throw new ApiErrors(400,"Comment not deleted");
    }
    
    await Promise.all([
        Like.deleteMany({comment:commentId}),
        Dislike.deleteMany({comment:commentId})
    ])

    return res.status(200).json(new ApiResponse(200,null,"Comment deleted successfully"));
})

const createTweetComment = asyncHandler(async (req,res)=>{

    const {tweetId} = req.params;
    const {content} = req.body;
    

    if(!isValidObjectId(tweetId)){
        throw new ApiErrors(400,"Invalid tweet id");
    }

    const comment = await Comment.create({
        content,
        tweet:tweetId,
        commentOwner:req.user?._id
    })
   
    if(!comment){
        throw new ApiErrors(400,"Comment not created");
    }
    

    const commentInfo = await Comment.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(`${comment._id}`)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"commentOwner",
                foreignField:"_id",
                as:"commentOwner",
                pipeline:[
                    {
                        $lookup:{
                            from:"likes",
                            localField:"_id",
                            foreignField:"tweet",
                            as:"likes"
                        }
                    },
                    {
                         $lookup:{
                            from:"dislikes",
                            localField:"_id",
                            foreignField:"tweet",
                            as:"dislikes"
                         }
                    },
                    {
                        $addFields:{
                            likesCount:{$size:"$likes"},
                            dislikesCount:{$size:"$dislikes"}
                        }
                    }
                ]

            }
        },
        {
            $unwind:"$commentOwner"
        },
        {
           $project:{
                content:1,
                createdAt:1,
                commentOwner:{
                     fullName:1,
                     userName:1,
                     avatar:1,
                     likesCount:1,
                     dislikesCount:1
                },
                createdAt:1
                
           }
        },
       
    ])

    if (!commentInfo) {
        throw new ApiErrors(400,"Comment not created");
        
    }

    return res.status(201).json(new ApiResponse(201,commentInfo[0],"Comment created successfully"));

})

const getTweetComments = asyncHandler(async (req,res)=>{

    const {tweetId} = req.params;

    if(!isValidObjectId(tweetId)){
        throw new ApiErrors(400,"Invalid tweet id");
    }

    const comments = await Comment.aggregate([
          {
                $match:{tweet:new mongoose.Types.ObjectId(`${tweetId}`)}
          },
          {
               $lookup:{
                   from:"users",
                   localField:"commentOwner",
                   foreignField:"_id",
                   as:"commentOwner",
               }
          },
          {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"comment",
                as:"likes",
            }
          },
          {
            $lookup:{
                from:"dislikes",
                localField:"_id",
                foreignField:"comment",
                as:"dislikes",
            }
          },
            {
                $addFields:{
                    likesCount:{$size:"$likes"},
                    dislikesCount:{$size:"$dislikes"}
                }
            },
            {
                $project:{
                    content:1,
                    createdAt:1,
                    commentOwner:{
                        fullName:1,
                        userName:1,
                        avatar:1,
                    },
                    likesCount:1,
                    dislikesCount:1
                }
            }
          
    ])
    
    if (!comments) {
        throw new ApiErrors(400,"Comments not found");
    }

    if(comments.length === 0){
        return res.status(200).json(new ApiResponse(200,[],"No comments found"));
    }

    return res.status(200).json(new ApiResponse(200,comments,"Comments fetched successfully"));
})

const updateTweetComment = asyncHandler(async (req,res)=>{

    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if(!content){
        throw new ApiErrors(400,"Content is required");
    }

    if(!isValidObjectId(commentId)){
        throw new ApiErrors(400,"Invalid comment id");
    }

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiErrors(400,"Comment not found");
    }

    if(comment.commentOwner.toString() !== userId.toString()){
        throw new ApiErrors(401,"You are not authorized to update this comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId,{content},{new:true});

    if(!updatedComment){
        throw new ApiErrors(400,"Comment not updated");
    }

    return res.status(200).json(new ApiResponse(200,updatedComment,"Comment updated successfully"));
});

const deleteTweetComment = asyncHandler(async (req,res)=>{

    const { commentId } = req.params;
    const userId = req.user?._id;

    if(!isValidObjectId(commentId)){
        throw new ApiErrors(400,"Invalid comment id");
    }

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiErrors(400,"Comment not found");
    }

    if(comment.commentOwner.toString() !== userId.toString()){
        throw new ApiErrors(401,"You are not authorized to delete this comment");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if(!deletedComment){
        throw new ApiErrors(400,"Comment not deleted");
    }

    await Promise.all([
        Like.deleteMany({comment:commentId}),
        Dislike.deleteMany({comment:commentId})
    ])

    return res.status(200).json(new ApiResponse(200,null,"Comment deleted successfully"));

});

export {createVideoComment,getVideoComments,deletedVideoComment,updateVideoComment, createTweetComment, getTweetComments, updateTweetComment,deleteTweetComment};
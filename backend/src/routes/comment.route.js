import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { createVideoComment , getVideoComments, deletedVideoComment,updateVideoComment, createTweetComment, getTweetComments, updateTweetComment,deleteTweetComment} from "../controllers/comment.controller.js";

const router = Router();

router.route("/v/:videoId").get(getVideoComments);
router.route("/t/:tweetId").get(getTweetComments);

router.use(verifyUser);

router.route("/v/:videoId").post(createVideoComment);
router.route("/v/:commentId").delete(deletedVideoComment).patch(updateVideoComment);
router.route("/t/:tweetId").post(createTweetComment);
router.route("/t/:commentId").patch(updateTweetComment).delete(deleteTweetComment);
export default router;
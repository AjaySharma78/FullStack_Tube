import { Router } from "express";
import {
  toggleVideoDisLike,
  toggleVideoCommentDisLike,
  toggleTweetCommentDislike,
  toggleTweetDislike,
} from "../controllers/dislike.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyUser);

router.route("/toggle/v/:videoId").patch(toggleVideoDisLike);
router.route("/toggle/v/c/:commentId").patch(toggleVideoCommentDisLike);
router.route("/toggle/t/:tweetId").patch(toggleTweetDislike);
router.route("/toggle/t/c/:commentId").patch(toggleTweetCommentDislike);
export default router;

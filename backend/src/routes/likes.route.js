import { Router } from 'express';
import { toggleVideoLike, getLikedVideos , toggleVideoCommentLike, toggleTweetLike, toggleTweetCommentLike} from '../controllers/likes.controller.js';
import { verifyUser } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyUser);

router.route("/toggle/v/:videoId").patch(toggleVideoLike);
router.route("/toggle/c/:commentId").patch(toggleVideoCommentLike);
router.route("/toggle/t/c/:commentId").patch(toggleTweetCommentLike);
router.route("/toggle/t/:tweetId").patch(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router
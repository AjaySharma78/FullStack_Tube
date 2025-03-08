import {
  createTweet,
  getUsertweets,
  updateTweet,
  deleteTweet,
  getTweetById,
  allTweets
} from "../controllers/tweet.controller.js";
import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.get("/all", allTweets);
router.use(verifyUser);

router
  .route("/")
  .post(
    upload.fields([
      { name: "images", maxCount: 10 },
      { name: "videos", maxCount: 5 },
    ]),
    createTweet
  )
  .get(getUsertweets);
router
  .route("/t/:tweetId")
  .patch(updateTweet)
  .delete(deleteTweet)
  .get(getTweetById);

export default router;

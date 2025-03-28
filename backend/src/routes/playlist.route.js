import { Router } from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  removeAllVideoFromPlaylist,
  getUserPlaylist,
  deletePlaylist
} from "../controllers/playlist.controller.js";

const router = Router();

router.route("/get-user-playlist/:userId").get(getUserPlaylist);

router.use(verifyUser);

router.route("/").post(createPlaylist);
router
  .route("/remove-all-video/playlist/:playlistId")
  .patch(removeAllVideoFromPlaylist)
  .delete(deletePlaylist);
router
  .route("/add-remove/video/playlist")
  .patch(addVideoToPlaylist)
  .delete(removeVideoFromPlaylist);

export default router;

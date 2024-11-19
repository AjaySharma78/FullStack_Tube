import { toggleSubscribe ,subscribedChannel, subscription, getSubscribers } from "../controllers/subscription.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { Router } from 'express';

const router = Router();
router.use(verifyUser);

router.route("/").get(subscription);
router.route("/channel").get(subscribedChannel);
router.route("/subscribers").get(getSubscribers);
router.route("/togglesubscription/:channelId").post(toggleSubscribe);

export default router;


import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./env/config.js";
import passport from "./service/passport.js";
import session from "express-session";
import helmate from "helmet";
import { Server } from "socket.io";
import http from "http";
import rateLimit from "express-rate-limit";


const app = express();
app.set('trust proxy', 1);
app.use(helmate());

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100, 
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(limiter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    credentials: true,
  },
});


app.use(
  session({
    secret: config.sessonSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    },
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });
import userRouter from "./routes/user.route.js";
import videoRouter from "./routes/video.route.js";
import likeRouter from "./routes/likes.route.js";
import dislikeRouter from "./routes/disLike.route.js";
import commentRouter from "./routes/comment.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import tweetRouter from "./routes/tweet.route.js";
import playlistRouter from "./routes/playlist.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/dislikes", dislikeRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/notification", (req, res) => {
  io.emit("notification", { message: "Hello from server" });
  console.log("Notification sent");
  res.send("Notification sent");
});
import errorHandler from "./middlewares/error.middlewares.js";
app.use(errorHandler);
app.set("io", io);
export { app , server, io};

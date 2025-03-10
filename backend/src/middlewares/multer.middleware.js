import multer from "multer";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { ApiResponse } from "../utils/apiResponse.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/temp"));
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });

export const compressVideo = (req, res, next) => {
  if (!req.files) {
    return next();
  }

  const filePath = req.files.video[0].path;
  const fileSizeInBytes = fs.statSync(filePath).size;
  const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

  if (fileSizeInMB <= 99) {
    return next();
  }

  const newFilePath = path.join(path.dirname(filePath), `compressed-${req.files.video[0].filename}`);

  const controller = new AbortController();
  req.abortController = controller;

  const ffmpegProcess = ffmpeg(filePath)
  .output(newFilePath)
    .videoCodec("libx264") // H.264 for best balance of size & quality
    .audioCodec("aac")
    .size("?x720") // 480p resolution

    if(fileSizeInMB >= 99 && fileSizeInMB <= 150) {
      ffmpegProcess.outputOptions([
        "-preset veryfast",  // Fastest good quality compression
        "-crf 25",           // Lower quality (higher CRF = smaller size, 28 is a good balance)
        "-b:v 900k",         // Target 400kbps bitrate (adjustable)
        "-maxrate 1080k",     // Max bitrate
        "-bufsize 1080k",
        "-b:a 64k",          // Lower audio bitrate (saves space)
        "-movflags +faststart", // Optimized for streaming
      ]);
    } else {
      ffmpegProcess.outputOptions([
        "-preset veryfast",  // Fastest good quality compression
        "-crf 32",           // Lower quality (higher CRF = smaller size, 28 is a good balance)
        "-b:v 350k",         // Target 500kbps bitrate (adjustable)
        "-maxrate 400k",     // Max bitrate
        "-bufsize 800k",
        "-b:a 64k",          // Lower audio bitrate (saves space)
        "-movflags +faststart", // Optimized for streaming
      ]);

    }
    ffmpegProcess.on('progress', (progress) => {
      req.io.emit(`video-compress-progress`, { percent: progress.percent,done: false });
    })
    .on('end', () => {
      const compressedFileSizeInBytes = fs.statSync(newFilePath).size;
      const compressedFileSizeInMB = compressedFileSizeInBytes / (1024 * 1024);

      if (compressedFileSizeInMB > 105) {
        fs.unlinkSync(newFilePath);
        return res
        .status(200)
        .json(new ApiResponse(400, "Video compression failed. Please try again. File size is too large."));
      }

      fs.unlinkSync(filePath); 
      req.files.video[0].path = newFilePath;
      req.files.video[0].filename = `compressed-${req.files.video[0].filename}`;
      req.io.emit(`video-compress-progress`, { percent: 100, done: true });
      next();
    })
    .on('error', (err) => {
      console.error('Error compressing video:', err);
      next(err); 
    })

    controller.abort('abort', () => {
      ffmpegProcess.kill('SIGKILL');
      fs.unlinkSync(filePath);
      console.log('Video compression aborted');
      req.io.emit(`video-compress-progress`, { percent: 0, done: true, aborted: true });
      next(new Error('Video compression aborted'));
    });

    ffmpegProcess.run();
};
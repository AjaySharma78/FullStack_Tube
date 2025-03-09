import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import config from "../env/config.js";
import { io } from "../app.js";
// import { Transform } from "stream";
cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

const uploadTOCloudinary = async (file, folder, type) => {
  
  try {
    if (!file) return null;
    // const uploadResult = await cloudinary.uploader.upload(file, {
    //   resource_type:"auto",
    //   folder: `${folder}`,
    // });
    // console.log(uploadResult);
    // fs.unlinkSync(file);
    // return uploadResult;

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: `${type}`,
          folder: `${folder}`,
          timeout: 60*60*1000,
        },
        (error, result) => {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
       const totalBytes = fs.statSync(file).size;
      let bytesUploaded = 0;
      let lastPercent = 0;
      fs.createReadStream(file)
      .on("data", (chunk) => {
        bytesUploaded += chunk.length;
        const percent = Math.round((bytesUploaded / totalBytes) * 100);
        if (percent !== lastPercent) {
          lastPercent = percent;
          io.emit("uploadProgress", { percent : percent, done: false });
        }
      })
      .pipe(uploadStream)
      .on("end", () => {
      io.emit("uploadProgress", { percent: 100, done: true });
      })
  });
     fs.unlinkSync(file);
    return result;
  } catch (error) {
    fs.unlinkSync(file);
    return null;
  }
};

const deleteFromCloudinary = async (publicId, folder, resource_type) => {
  try {
    if (!publicId) return null;
    const deleteResult = await cloudinary.uploader.destroy(
      `${folder}/${publicId}`,
      {
        resource_type: resource_type === "video" ? "video" : "image",
      }
    );
    return deleteResult;
  } catch (error) {
    return null;
  }
};

export { uploadTOCloudinary, deleteFromCloudinary };

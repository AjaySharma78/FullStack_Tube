import {
  uploadVideo,
  updateVideoTitleDescription,
} from "../app/api/videoApi.ts";
import { VideoUploadInterface } from "../interface/videoUploadInterface.ts";
import { setVideos } from "../app/api/slice/videoSlice.ts";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button, Input } from "../components/Index.ts";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { encryptData } from "../utils/format.ts";
import { useNavigate } from "react-router-dom";
import { initSocket } from "../socket.ts";
import { Socket } from "socket.io-client";
import RTE from "../components/RTE.tsx";
import { toast } from "sonner";

const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; 
const MAX_VIDEO_SIZE = 95 * 1024 * 1024; 
const MAX_VIDEO_DURATION = 25 * 60; 

const PostVideo = ({ post, showEditCard, handleEditVideo }: any) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const videos = useSelector((state: any) => state.video.videos);
  const user = useSelector((state: any) => state.auth.user);
  const socketRef = useRef<typeof Socket | null>(null);
  const [isLoading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState,
    watch,
    setValue,
    control,
    getValues,
  } = useForm<VideoUploadInterface>({
    defaultValues: {
      title: post?.title || "",
      description: post?.description || "",
      thumbnail: post?.thumbnail || "",
      video: post?.videoFile || "",
    },
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [compressProgress, setCompressProgress] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const formDataRef = useRef<VideoUploadInterface | null>(null);
  const thumbnail = watch("thumbnail");
  const { errors } = formState;
  const video = watch("video");

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current?.on(
        "video-compress-progress",
        (data: { done: boolean; percent: number }) => {
          setCompressProgress(data.done ? null : Math.floor(data.percent));
        }
      );
      socketRef.current?.on(
        "uploadProgress",
        (data: { done: boolean; percent: number }) => {
          setUploadProgress(data.done ? null : Math.floor(data.percent));
          setLoading(!data.done);
        }
      );
    };

    init();
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const storeFileUrlInLocalStorage = (file: File, key: string) => {
    const fileUrl = URL.createObjectURL(file);
    localStorage.setItem(key, fileUrl);
  };

  useEffect(() => {
    const savedThumbnail = localStorage.getItem("thumbnailPreview");
    if (savedThumbnail) setThumbnailPreview(savedThumbnail);

    const savedVideo = localStorage.getItem("videoPreview");
    if (savedVideo) setVideoPreview(savedVideo);

    const savedData = localStorage.getItem("videoUploadData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.keys(parsedData).forEach((key) =>
        setValue(key as keyof VideoUploadInterface, parsedData[key])
      );
    }
  }, []);

  const create: SubmitHandler<VideoUploadInterface> = async (data) => {
    formDataRef.current = data;
    localStorage.setItem("videoUploadData", JSON.stringify(data));
    if (data.thumbnail)
      storeFileUrlInLocalStorage(
        thumbnail[0] as unknown as File,
        "thumbnailPreview"
      );
    if (data.video)
      storeFileUrlInLocalStorage(video[0] as unknown as File, "videoPreview");

    toast.promise(
      new Promise<string>(async (resolve, reject) => {
        try {
          if (post) {
            const response = await updateVideoTitleDescription(post._id, data);
            navigate(
              `/videos/${response.data._id}/${user ? user._id : "null"}/${
                user ? "null" : "null"
              }`
            );
          } else {
            setLoading(true);
            const response = await uploadVideo(data);
            if (!response.success) toast.error(response.message);
            if (response.message === "Video uploaded successfully") {
              resolve("Video uploaded successfully");
              dispatch(setVideos([...videos, response.data]));
              localStorage.removeItem("videoUploadData");
              localStorage.removeItem("thumbnailPreview");
              localStorage.removeItem("videoPreview");
              const encryptedVideoId = encryptData(response.data._id);
              const encryptedUserId = encryptData(user ? user._id : null);
              const encryptedPlaylistOwnerId = encryptData(null);
              navigate(
                `/videos/${encryptedVideoId}/${encryptedUserId}/${encryptedPlaylistOwnerId}`
              );
            }
          }
        } catch (error: any) {
          reject("Something went wrong try again later");
          setCompressProgress(null);
          setUploadProgress(null);
        } finally {
          setLoading(false);
        }
      }),
      {
        loading: `Uploading Video...`,
        success: (message: string) => message,
        error: (message: string) => message,
      }
    );
  };

  useEffect(() => {
    if (thumbnail && thumbnail.length > 0) {
      if (post) {
        setThumbnailPreview(post.thumbnail);
      } else {
        const file: File = thumbnail[0] as unknown as File;
        const previewUrl = URL.createObjectURL(file);
        setThumbnailPreview(previewUrl);
      }
    }
  }, [thumbnail]);

  useEffect(() => {
    if (video && video.length > 0) {
      if (post) {
        setVideoPreview(post.videoFile);
      } else {
        const previewUrl = URL.createObjectURL(video[0] as unknown as File);
        setVideoPreview(previewUrl);
      }
    }
  }, [video]);


  return (
    <div
      className={`flex items-center justify-center w-full h-screen px-1 py-5 md:p-5`}
    >
      <div
        className={`h-full w-full bg-gray-100 rounded-xl border border-black/10 dark:border-zinc-600 dark:bg-zinc-900 overflow-y-auto`}
      >
        {showEditCard && (
          <button
            className="absolute top-14 right-10 dark:text-white hover:text-red-500 dark:hover:text-red-500"
            onClick={handleEditVideo}
          >
            X
          </button>
        )}
        {!isLoading && (
          <p className="flex text-xs justify-center md:animate-bounce bg-red-800 p-1 text-white font-light rounded-t-md">
            Requested file size limit is 5MB for Thumbnail and 95MB for Video
            and Video duration must be less than 20 minutes.
          </p>
        )}
        <h2 className="text-center text-lg md:text-2xl font-bold leading-tight dark:text-white">
          Upload Video
        </h2>
        {isLoading && (
          <div className="w-full grid place-content-center mt-2">
            <img
              className="w-[30px]"
              src="https://media.tenor.com/wpSo-8CrXqUAAAAi/loading-loading-forever.gif"
              alt="loading"
              style={{ width: "30px" }}
            />{" "}
          </div>
        )}
        <div className="w-full flex justify-center items-center relative">
          {compressProgress != null && (
            <div className="absolute w-full h-full">
              <p className="text-black font-bold text-center absolute bottom-0 right-0 p-1 text-sm dark:text-white">
                {compressProgress}%
              </p>
              <div className="relative w-full bg-gray-300 h-1 mt-2 overflow-auto">
                <div
                  className={`absolute h-full bg-gradient-to-r from-purple-400 via-50% to-purple-500 to-90% `}
                  style={{ width: `${compressProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full flex justify-center items-center relative ">
          {uploadProgress != null && (
            <div className="absolute w-full h-full">
              <p className="text-black font-bold text-center absolute bottom-0 right-0 p-1 text-sm dark:text-white">
                {uploadProgress}%
              </p>
              <div className="relative w-full bg-gray-300 h-1 mt-2 overflow-auto">
                <div
                  className={`absolute h-full bg-gradient-to-r animate-wiggle from-purple-400 via-50% to-purple-500 to-90%  dark:from-purple-600 dark:via-50% dark:to-purple-900 darkto-90%  `}
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        <form
          onSubmit={handleSubmit(create)}
          className="mt-5 p-1 md:p-3  md:mt-0 w-full"
        >
          <div className="w-full flex gap-2 justify-between items-start flex-wrap">
            <div className=" w-full h-full flex justify-between gap-2 flex-wrap lg:flex-nowrap">
              <div className="w-full h-full">
                <Input
                  className="py-2 px-3 text-sm"
                  label="Title: "
                  mess={errors.title ? String(errors.title.message) : ""}
                  placeholder="Enter your Title"
                  {...register("title", {
                    required: {
                      value: true,
                      message: "Title is required",
                    },
                  })}
                />

                <RTE
                  label="Description/Summary :"
                  control={control}
                  defaultValue={getValues("description")}
                  mess={
                    errors.description ? String(errors.description.message) : ""
                  }
                  {...register("description", {
                    required: {
                      value: true,
                      message: "Description is required",
                    },
                  })}
                />
              </div>
              <div className="w-full h-full">
                <Input
                  className="py-2 text-sm"
                  label="Video Thumbnail: "
                  placeholder="Enter your email"
                  disabled={post?.thumbnail ? true : false}
                  mess={
                    errors.thumbnail ? String(errors.thumbnail.message) : ""
                  }
                  type="file"
                  {...register("thumbnail", {
                    required: {
                      value: post ? false : true,
                      message: "Thumbnail is required",
                    },
                    validate: async (fileList) => {
                      if (!fileList.length) return "Cover image is required.";
                      const file = fileList[0] as unknown as File;

                      if (file.size > MAX_THUMBNAIL_SIZE) {
                        return "File size must be less than 5MB.";
                      }

                      if (
                        !file.type.includes("image/png") &&
                        !file.type.includes("image/jpeg") &&
                        !file.type.includes("image/jpg")
                      ) {
                        return "Invalid image format";
                      }
                      return true;
                    },
                  })}
                />
                <div className="flex gap-2">
                  {thumbnailPreview && (
                    <div className="mt-2 w-[28%]">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail Preview"
                        className="w-full h-full rounded-md object-cover"
                      />
                    </div>
                  )}
                  {videoPreview && (
                    <div className="mt-2 w-[72%]">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full h-full rounded-md "
                      />
                    </div>
                  )}
                </div>
                <Input
                  className="py-2 text-sm w-full"
                  label="Select Video: "
                  type="file"
                  disabled={post?.videoFile ? true : false}
                  mess={errors.video ? String(errors.video.message) : ""}
                  placeholder="Enter your password"
                  {...register("video", {
                    required: {
                      value: post ? false : true,
                      message: "Video is required",
                    },
                    validate: async (fileList) => {
                      if (!fileList.length) return "Video is required.";
                      const file = fileList[0] as unknown as File;

                     if (file.size > MAX_VIDEO_SIZE) {
                        return "File size must be less than 95MB.";
                      }
                      if (
                        !file.type.includes("video/mp4") &&
                        !file.type.includes("video/mkv") &&
                        !file.type.includes("video/avi")
                      ) {
                        return "Invalid video format";
                      }
                      const videoDuration = await new Promise<number>(
                        (resolve, reject) => {
                          const video = document.createElement("video");
                          video.preload = "metadata";

                          video.onloadedmetadata = () => {
                            URL.revokeObjectURL(video.src);
                            resolve(video.duration);
                          };

                          video.onerror = () => {
                            reject("Unable to load video");
                          };

                          video.src = URL.createObjectURL(file);
                        }
                      );

                   
                      if (videoDuration > MAX_VIDEO_DURATION) {
                        return "Video duration must be less than 25 minutes.";
                      }
                      
                      return true;
                    },
                  })}
                />
                {!showEditCard && (
                  <div className=" w-full flex gap-2 py-2 ">
                    <label className="text-sm dark:text-white">
                      Publish Video:
                    </label>
                    <select
                      className="text-sm focus:outline-none"
                      {...register("isPublished", { required: true })}
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            type="submit"
            className={`${
              isLoading ? "cursor-default" : "cursor-pointer"
            } w-full mt-2 rounded-md dark:hover:text-white`}
            bgColor={`${
              isLoading ? "bg-purple-200 dark:bg-zinc-400" : "hover:bg-purple-500 bg-purple-400 dark:bg-black dark:hover:bg-zinc-800"
            } `}
            disabled={isLoading}
          >
            {post ? `Update Post` : `Upload Video`}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PostVideo;

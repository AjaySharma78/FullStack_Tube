import { updateAvatar, updateCoverImage } from "../app/api/authApis.ts";
import { selectCurrentUser } from "../app/api/slice/authSlice.ts";
import { useForm, SubmitHandler } from "react-hook-form";
import { updateThumbnail } from "../app/api/videoApi.ts";
import { setUser } from "../app/api/slice/authSlice.ts";
import { Video } from "../interface/videointerface.ts";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { Button, Input } from "./Index.ts";
import { toast } from "sonner";

interface UpdateImageProps {
  videoId?: string | null;
  handleUpdateImage?: () => void;
  setItems?: React.Dispatch<React.SetStateAction<Video[] | any>>;
  type: "thumbnail" | "avatar" | "coverImage";
}

interface ImageData {
  thumbnail: string;
  coverImage: string;
  avatar: string;
}

const UpdateImage: React.FC<UpdateImageProps> = ({
  videoId,
  handleUpdateImage,
  setItems,
  type,
}) => {
  const { register, handleSubmit, formState, watch } = useForm<ImageData>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const thumbnail = watch(type);
  const { errors } = formState;

  const onSubmit: SubmitHandler<ImageData> = async (data) => {
   toast.promise(
    new Promise<string>(async (resolve, reject) => {
      try {
        let response;
        if (type === "thumbnail") {
          response = await updateThumbnail(videoId!, data);
        } else if (type === "coverImage") {
          response = await updateCoverImage(data);
        } else {
          response = await updateAvatar(data);
        }
  
        if (type === "thumbnail") {
          setItems &&
            setItems((prev: any) => {
              return prev.map((item: Video) => {
                if (item._id === videoId) {
                  return {
                    ...item,
                    thumbnail: response.data.thumbnail,
                  };
                }
                return item;
              });
            });
            resolve("Thumbnail updated successfully");
        } else if (type === "coverImage") {
          dispatch(
            setUser({
              ...user,
              coverImage: response.data.user.coverImage,
            })
          );
          resolve("Cover image updated successfully");
        } else {
          dispatch(
            setUser({
              ...user,
              avatar: response.data.user.avatar,
            })
          );
          resolve("Avatar updated successfully");
        }
  
        handleUpdateImage && handleUpdateImage();
      } catch (error) {
        reject("Failed to update image");
      }
    }),
    {
      loading: `Updating ${type}...`,
      success: (message: string) => message,
      error: "Failed to update image",
    }
   )
    
  };



  useEffect(() => {
    if (thumbnail && thumbnail.length > 0) {
      const file: File = thumbnail[0] as unknown as File;
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  }, [thumbnail]);

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className=" bg-gray-200 dark:bg-zinc-800 p-6 rounded-lg shadow-lg w-11/12 lg:w-1/2 max-w-md">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold mb-4 dark:text-zinc-400">Update {type}</h2>
          <button className="dark:text-white hover:text-red-500 dark:hover:text-red-500" onClick={() => handleUpdateImage && handleUpdateImage()}>
            X
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            className="py-2 text-sm"
            label={`New ${type}: `}
            type="file"
            mess={errors[type]?.message}
            {...register(type, {
              required: {
                value: true,
                message: `${type} is required`,
              },
              validate: async (fileList) => {
                if (!fileList.length) return "Cover image is required.";
                const file = fileList[0] as unknown as File;
          
                if (file.size > 5 * 1024 * 1024 ) {
                  return `File size must be less than 5MB`;
                }
          
                const image = await new Promise<HTMLImageElement>((resolve) => {
                  const img = new Image();
                  img.onload = () => resolve(img as HTMLImageElement);
                  img.src = URL.createObjectURL(file);
                });
          
                if (type === "coverImage" && (image.width < 900 || image.width > 1500 || image.height < 200 || image.height > 400)) {
                  return "CoverImage must be 900-1500px wide and 200-400px high.";
                }
                return true;
              },
            })}
          />
          {imagePreview && (
            <div className="mt-2 w-full h-60">
              <img
                src={imagePreview}
                alt={`${type} Preview`}
                className="w-full h-full rounded-md object-cover"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-4 rounded-md"
            bgColor="hover:bg-purple-500 bg-purple-400"
          >
            Update {type}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UpdateImage;

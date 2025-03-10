import { selectCurrentUser } from "../app/api/slice/authSlice";
import UpdateImage from "../components/UpdateImage";
import Updatetext from "../components/Updatetext";
import editText from "../assets/edittext.png";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Edit from "../assets/edit.png";
import EditProfileSkeleton from "../components/Skeleton/EditProfileSkeleton"

const Profile = () => {
  const [thumbnailVideoId, setThumbnailVideoID] = useState<string | null>(null);
  const [showThumbnaiUpdateCard, setShowThumbnaiUpdateCard] = useState(false);
  const [showEditProfileInfo, setShowEditProfileInfo] = useState(false);
  const [imageType, setImageType] = useState<string | null>(null);
  const [textType, setTextType] = useState<string | null>(null);
  const user = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);
  
  const getRandomColor = (id: string) => {
    const letters = "0123456789ABCDEF";
    const getColor = (seed: number) => {
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[(id.charCodeAt((i + seed) % id.length) + i) % 16];
      }
      return color;
    };

    const color1 = getColor(0);
    const color2 = getColor(3);
    return `linear-gradient(to right, ${color1}, ${color2})`;
  };

  const handleUpdateThumbnail = (videoId: string) => {
    setThumbnailVideoID(videoId);
    setShowThumbnaiUpdateCard(!showThumbnaiUpdateCard);
  };

  const handleUpdateCoverImage = (imgtype: string) => {
    setImageType(imgtype);
  };

  const handleUpdateTextType = (textType: string) => {
    setTextType(textType);
  };

  const handleEditProfileInfo = () => {
    setShowEditProfileInfo(!showEditProfileInfo);
  };

  if (loading) {
    return <EditProfileSkeleton />;
  }

  return (
    <div className="w-full h-full select-none overflow-y-auto ">
      {showThumbnaiUpdateCard && (
        <UpdateImage
          videoId={thumbnailVideoId}
          handleUpdateImage={() =>
            handleUpdateThumbnail && handleUpdateThumbnail("")
          }
          type={imageType as "coverImage" | "avatar"}
        />
      )}
      {showEditProfileInfo && (
        <Updatetext
          handleClose={handleEditProfileInfo}
          type={textType as "userName" | "fullName" | "email"}
        />
      )}
      <div className="mx-2 md:mx-14 mt-2 md:mt-5">
        <div className="relative w-full h-44 md:h-52 rounded-xl dark:ring-1 dark:ring-zinc-600">
          <div
            onClick={() => {
              handleUpdateThumbnail(`${user?._id}`);
              handleUpdateCoverImage("coverImage");
            }}
            className="absolute top-2 right-2 w-7 h-7 md:w-10 md:h-10 bg-white dark:bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-300"
          >
            <img src={Edit} alt="image/png" className="w-5 md:w-7" />
          </div>
          {user?.coverImage ? (
            <img
              src={user?.coverImage}
              alt="cover"
              className="w-full h-full object-fill rounded-xl"
            />
          ) : (
            <div
              style={{
                background: user?._id ? getRandomColor(user._id) : "none",
              }}
              className="w-full h-full text-white flex flex-col items-center justify-center cursor-pointer rounded-xl"
            >
              <div className="text-4xl font-bold">{user?.fullName}</div>
              <div className="mt-2 text-black">
                <div className="font-semibold">@{user?.userName}</div>{" "}
              </div>
            </div>
          )}
        </div>
        <div className="w-full h-28 md:h-44 my-5 flex items-start justify-start gap-5">
          <div className="relative w-28 md:w-44 h-full rounded-full">
            <div
              onClick={() => {
                handleUpdateThumbnail(`${user?._id}`);
                handleUpdateCoverImage("avatar");
              }}
              className="absolute bottom-0 right-0 md:bottom-3 md:right-1 w-8 h-8 bg-white dark:bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-300"
            >
              <img src={Edit} alt="image/png" className="w-6" />
            </div>
            <img
              src={user?.avatar}
              alt="image"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className=" dark:text-zinc-400 ">
            <h1 className="text-2xl md:text-4xl font-bold">{user?.fullName}</h1>
            <h3 className="flex">
              <span className="font-semibold mt-2 text-sm">@{user?.userName}</span>{" "}
              <span>
                <img
                  onClick={() => {
                    handleEditProfileInfo();
                    handleUpdateTextType("userName");
                  }}
                  className=" w-5 h-5  ml-1 mt-2 cursor-pointer"
                  src={editText}
                  alt="imgae/png"
                />
              </span>
            </h3>
            <p className="mt-2 text-sm">
              Hey it's me{" "}
              <Link className="text-blue-600 " to={`/user/@${user?.userName}`}>
                {user?.fullName}
              </Link>
              .{" "}
            </p>
          </div>
        </div>
        <div className="w-full my-5 text-xs md:text-base">
          <table className="min-w-full bg-white dark:bg-zinc-700 dark:text-zinc-400">
            <tbody>
              <tr>
                <td className="py-2 px-2 border-b border-gray-200 dark:border-zinc-600">Email</td>
                <td className="py-2 px-2 border-b border-gray-200 dark:border-zinc-600">
                  {user?.email}
                </td>
                <td className="py-2 px-4 border-b border-gray-200 dark:border-zinc-600">
                  <img
                    onClick={() => {
                      handleEditProfileInfo();
                      handleUpdateTextType("email");
                    }}
                    className="w-5 h-5 cursor-pointer"
                    src={editText}
                    alt="image/png"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2 px-2 border-b border-gray-200 dark:border-zinc-600">Username</td>
                <td className="py-2 px-2 border-b border-gray-200 dark:border-zinc-600">
                  {user?.userName}
                </td>
                <td className="py-2 px-4 border-b border-gray-200 dark:border-zinc-600">
                  <img
                    onClick={() => {
                      handleEditProfileInfo();
                      handleUpdateTextType("userName");
                    }}
                    className="w-5 h-5 cursor-pointer"
                    src={editText}
                    alt="image/png"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2 px-2 border-b border-gray-200 dark:border-zinc-600">
                  Full Name
                </td>
                <td className="py-2 px-2 border-b border-gray-200 dark:border-zinc-600">
                  {user?.fullName}
                </td>
                <td className="py-2 px-4 border-b border-gray-200 dark:border-zinc-600">
                  <img
                    onClick={() => {
                      handleEditProfileInfo();
                      handleUpdateTextType("fullName");
                    }}
                    className="w-5 h-5 cursor-pointer"
                    src={editText}
                    alt="image/png"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Profile;

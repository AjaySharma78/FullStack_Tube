import { selectCurrentStatus, selectCurrentUser } from "../app/api/slice/authSlice";
import { IoMdNotificationsOff, IoMdNotificationsOutline } from "react-icons/io";
import UserProfileSkeleton from "../components/Skeleton/UserProfileSkeleton";
import { UserProfileProps } from "../interface/userProfileInterface";
import { getUserChannelProfile } from "../app/api/authApis";
import { Link, Outlet, useParams } from "react-router-dom";
import { PlayListProps } from "../interface/playlistprops";
import { toggleSubscribe } from "../app/api/subscribeApi";
import { userPlaylist } from "../app/api/playListApis";
import { encryptData } from "../utils/format";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../components/Button";
import { toast } from "sonner";

const UserProfile = () => {
  const user = useSelector(selectCurrentUser);
  const [userProfile, setUserProfile] = useState<UserProfileProps | null>(null);
  const [playList, setPlayList] = useState<PlayListProps[]>([]);
  const { userName } = useParams<{ userName: string }>();
  const authStatus = useSelector(selectCurrentStatus);
  const checkUser = userProfile?._id === user?._id;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trimmedUserName = userName?.replace(/^@/, "");
        const response = await getUserChannelProfile(
          `${trimmedUserName}`,
          user ? user._id : "null"
        );
        const playListresponse = await userPlaylist(response.data._id);
        setPlayList(playListresponse.data);
        setUserProfile(response.data);
      } catch (err: any) {
        console.log(err);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userName]);

  const handleSubscribeClick = async () => {
    toast.promise(
      new Promise<string>(async (resolve, reject) => {
        try {
          const response = await toggleSubscribe(`${userProfile?._id}`);
          if (!response.data) return;
          resolve(response.message);
          setUserProfile((prev) => {
            if (prev) {
              return {
                ...prev,
                isSubscribed: !prev.isSubscribed,
              };
            }
            return prev;
          });
        } catch (err) {
          reject("Something went wrong");
          console.log(err);
        }
      }),
      {
        loading: "Processing...",
        success: (msg: string) => msg,
        error: (msg: string) => msg,
      }
    );
  };
  
  const navItems = [
    {
      name: "Videos",
      slug: `/user/${userName}/videos`,
      active: true,
    },
    {
      name: "All Videos",
      slug: `/user/${userName}/all-videos`,
      active: checkUser,
    },
    {
      name: "Playlist",
      slug: `/user/${userName}/playlist/${encryptData(userProfile?._id)}`,
      active: true,
    },
  ];

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

  if (loading) {
    return (<UserProfileSkeleton />);
  }

  return (
    <div className="w-full h-full overflow-y-auto ">
      <div className="mx-2 md:mx-5 mt-2 md:mt-5">
        <div className="w-full md:h-52 ">
          {userProfile?.coverImage ? (
            <img
              src={userProfile?.coverImage}
              alt="cover"
              className="w-full h-full object-fill rounded-xl"
              typeof="image/jpg"
            />
          ) : (
            <div
              style={{
                background: userProfile?._id
                  ? getRandomColor(userProfile._id)
                  : "none",
              }}
              className="w-full h-full text-white  flex flex-col items-center justify-center  rounded-xl"
            >
              <h1 className="text-4xl font-bold">{userProfile?.fullName}</h1>
              <h3 className="mt-2 text-black">
                <span className="font-semibold">@{userProfile?.userName}</span>{" "}
                <span  >
                  | {userProfile?.subscriberCount} subscribers |{" "}
                  {userProfile?.videoCount} videos
                </span>
              </h3>
            </div>
          )}
        </div>
        <div className="w-full h-28 md:h-44 my-5 flex items-start justify-start gap-5 dark:text-zinc-400">
          <div className="w-28 md:w-44 h-full py-4 ">
            <img
              src={userProfile?.avatar}
              alt="image"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="w-full">
            <h1 className="text-2xl md:text-4xl font-bold">{userProfile?.fullName}</h1>
            <h3 className="mt-2 text-xs md:text-base">
              <span className="font-semibold">@{userProfile?.userName}</span>{" "}
              <span className="text-gray-600">
                | {userProfile?.subscriberCount} subscribers |{" "}
                {userProfile?.videoCount} videos
              </span>
            </h3>
            <p className="mt-2 text-xs md:text-base ">Hey it's me {userProfile?.fullName}. </p>
            <Button
              className="rounded-full mt-1 md:mt-8 text-xs"
              onClick={authStatus ? handleSubscribeClick : null}
            >
              {userProfile?.isSubscribed ? (
                <div className="flex items-center px-1">
                  <IoMdNotificationsOutline className="mx-1" /> Subscribed
                </div>
              ) : (
                <div className="flex items-center px-1">
                  <IoMdNotificationsOff className="mx-1" /> Subscribe
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full flex items-center justify-start px-14 p-1 sticky top-0 border-b-2 dark:border-zinc-500 bg-gray-100 dark:bg-black  z-[5]">
        <nav>
          <ul className="flex gap-5 p-1 font-semibold text-gray-600 text-sm md:text-base">
            {navItems.map(
              (item) =>
                item.active && (
                  <Link
                    to={item.slug}
                    key={item.slug}
                    className={`${
                      location.pathname === item.slug
                        ? " text-black border-b-2 border-black dark:text-white"
                        : ""
                    }`}
                  >
                    {item.name}
                  </Link>
                )
            )}
          </ul>
        </nav>
      </div>
      <Outlet context={{ userProfile, playList, setPlayList }} />
    </div>
  );
};

export default UserProfile;

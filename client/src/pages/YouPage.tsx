import Skeleton from "../components/Skeleton/Skeleton";
import Carousel from "../components/Carousel";
import { useEffect, useState } from "react";
import list from "../assets/carousel.png";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import grid from "../assets/grid.png";

const YouPage = () => {
  const userWatchHistory = useSelector(
    (state: any) => state.playlist.WatchHistory
  );
  const user = useSelector((state: any) => state.auth.user);
  const [watchgridView, setWatchGridView] = useState(false);
  const [likegridView, setLikeGridView] = useState(false);
  const [loading, setLoading] = useState(true);
  const userLikeHistory = useSelector(
    (state: any) => state.playlist.LikeHistory
  );

  useEffect(() => {
    if (userWatchHistory) {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [userWatchHistory]);

  useEffect(() => {
    if (userLikeHistory) {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [userLikeHistory]);

  const handleWatchGridView = () => {
    setWatchGridView(!watchgridView);
  };

  const handleLikeGridView = () => {
    setLikeGridView(!likegridView);
  };

  return (
    <div className="w-full h-screen overflow-y-auto dark:text-zinc-400">
      {loading ? (
        <div className="w-full h-44 flex items-start justify-start gap-5 p-5">
          <div className="relative w-[150px] h-[150px]">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
          <div className="w-[83%]">
            <Skeleton className="w-1/2 h-8 mb-2" />
            <Skeleton className="w-1/3 h-6 mb-2" />
            <Skeleton className="w-1/4 h-4" />
          </div>
        </div>
      ) : (
        <div className="w-full flex items-start justify-start gap-5 p-5">
          <div className="relative w-20 h-20 md:w-[150px] md:h-[150px]">
            <img
              src={user?.avatar}
              alt="image"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className=" md:w-[83%]">
            <h1 className="text-xl md:text-4xl font-bold">{user?.fullName}</h1>
            <h3 className="flex">
              <span className="text-sm md:font-semibold mt-0 md:mt-2">
                @{user?.userName}
              </span>{" "}
            </h3>
            <p className="mt-2 text-sm md:text-base">
              Hey it's me{" "}
              <Link className="text-blue-600" to={`/user/@${user?.userName}`}>
                {user?.fullName}
              </Link>
              .{" "}
            </p>
          </div>
        </div>
      )}
      <div className="w-full  p-1 md:p-5">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold py-4 dark:text-zinc-400">
            History
          </h1>
          <button className="mr-10" onClick={handleWatchGridView}>
            <img
              src={watchgridView ? list : grid}
              width={30}
              className="dark:bg-zinc-800 rounded-md"
              alt="image/png"
            />
          </button>
        </div>
        {loading ? (
          <div className="flex gap-4  w-full">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`bg-gray-200 dark:bg-zinc-500 animate-pulse rounded-lg shadow-md flex flex-col w-full ${
                  index > 1 ? "hidden md:block" : "block"
                }`}
              >
                <Skeleton className="w-full h-24 lg:h-44 rounded-md" />
                <div className="flex justify-between items-center p-2 h-20">
                  <Skeleton className="w-[60px] h-[50px] rounded-full" />
                  <div className="flex flex-col items-start w-4/5 h-full px-2">
                    <Skeleton className="w-3/4 h-4 mb-2" />
                    <Skeleton className="w-full h-4 mb-2" />
                    <Skeleton className="w-1/2 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : userWatchHistory && userWatchHistory.length > 0 ? (
          <Carousel slides={userWatchHistory} gridView={watchgridView} />
        ) : (
          <div className="text-center mt-10">
            <h2 className="text-2xl font-semibold">No Watch History</h2>
            <p className="text-gray-600">
              You have not watched any videos yet.
            </p>
          </div>
        )}
      </div>
      <div className="w-full p-1 md:p-5">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold py-4 dark:text-zinc-400">
            Like Video
          </h1>
          <button className="mr-10" onClick={handleLikeGridView}>
            <img
              src={likegridView ? list : grid}
              width={30}
              className="dark:bg-zinc-800 rounded-md"
              alt="image/png"
            />
          </button>
        </div>
        {loading ? (
          <div className="flex gap-4  w-full">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`bg-gray-200 dark:bg-zinc-500 animate-pulse rounded-lg shadow-md flex flex-col w-full ${
                  index > 1 ? "hidden md:block" : "block"
                }`}
              >
                <Skeleton className="w-full h-24 lg:h-44 rounded-md" />
                <div className="flex justify-between items-center p-2 h-20">
                  <Skeleton className="w-[60px] h-[50px] rounded-full" />
                  <div className="flex flex-col items-start w-4/5 h-full px-2">
                    <Skeleton className="w-3/4 h-4 mb-2" />
                    <Skeleton className="w-full h-4 mb-2" />
                    <Skeleton className="w-1/2 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : userLikeHistory && userLikeHistory.length > 0 ? (
          <Carousel slides={userLikeHistory} gridView={likegridView} />
        ) : (
          <div className="text-center mt-10">
            <h2 className="text-2xl font-semibold">No Like video</h2>
            <p className="text-gray-600">You have not Liked any videos yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouPage;

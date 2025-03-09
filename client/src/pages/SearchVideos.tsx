import {
  currentSearchVideos,
  setSearchVideos,
} from "../app/api/slice/playlistSlice";
import {
  formatWhenPosted,
  formatViews,
  encryptData,
  truncateTitle,
} from "../utils/format";
import SearchVideoSkeleton from "../components/Skeleton/SearchVideoSkeleton";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getVideos } from "../app/api/videoApi";
import { useEffect, useState } from "react";
import parse from "html-react-parser";
import Mute from "../assets/mute.png";
import Sound from "../assets/sound.png";

const SearchVideos = () => {
  const [isVideoLoading, setvideoIsLoading] = useState(true);
  const user = useSelector((state: any) => state.auth.user);
  const encryptedUserId = encryptData(user ? user._id : null);
  const SearchVideos = useSelector(currentSearchVideos);
  const encryptedPlaylistOwnerId = encryptData(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams] = useSearchParams();
  const [muted, setMuted] = useState(true);
  const query = searchParams.get("query");
  const dispatch = useDispatch();

  useEffect(() => {
    const featchData = async () => {
      try {
        const response = await getVideos(currentPage, `${query}`);
        dispatch(setSearchVideos(response.data.videoInfo));
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    featchData();
  }, [query, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleMute = () => {
    setMuted(!muted);
  };
  return (
    <div className="w-full h-screen overflow-y-auto p-1 md:p-5">
      <div className="w-full">
        {isLoading ? (
          <SearchVideoSkeleton />
        ) : !SearchVideos ? (
          <div className="text-center text-gray-500">No videos found.</div>
        ) : (
          SearchVideos.map((video) => (
            <div
              key={video._id}
              className="relative bg-gray-200 dark:bg-black md:p-3 shadow-md flex w-full md:h-64 group"
            >
              <div className="w-full flex flex-col md:flex-row items-center md:gap-4">
                <Link
                  className="w-full lg:w-[450px] h-full relative"
                  to={`/videos/${encryptData(
                    video._id
                  )}/${encryptedUserId}/${encryptedPlaylistOwnerId}`}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover rounded-md group-hover:hidden"
                  />
                  {isVideoLoading && isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-zinc-600 rounded-md">
                      <img
                        src="https://media.tenor.com/wpSo-8CrXqUAAAAi/loading-loading-forever.gif"
                        alt="loading"
                        style={{ width: "30px" }}
                      />
                    </div>
                  )}
                  <video
                    className=" cursor-pointer hidden group-hover:block object-cover rounded-lg"
                    onMouseEnter={(e) => {
                      e.currentTarget.play();
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                    }}
                    preload="auto"
                    muted={muted}
                    onLoadedData={() => setvideoIsLoading(false)}
                  >
                    <source src={video?.videoFile} type="video/mp4" />
                  </video>
                </Link>
                <div className="w-full md:w-[500px] h-full flex flex-col items-start dark:text-zinc-400">
                  <h3 className="line-clamp-1 font-semibold md:text-2xl">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] md:text-sm text-gray-700 md:py-1">
                    <h4>{formatViews(video.views)} views</h4> |
                    <h4>{formatWhenPosted(video.createdAt)}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 ">
                    <img
                      src={video.videoOwner.avatar}
                      alt="image/jpg"
                      className="w-6 h-6 object-cover rounded-full my-2"
                    />
                    <h2>{video.videoOwner.fullName}</h2>
                    <span>
                      <div
                        onClick={handleMute}
                        className="cursor-pointer w-15 h-15 hidden group-hover:block p-1 z-50 "
                      >
                        {muted ? (
                          <img
                            src={Mute}
                            alt="image/png"
                            className="w-8 h-8 bg-zinc-600 rounded-full p-1"
                          />
                        ) : (
                          <img
                            src={Sound}
                            alt="image/png"
                            className="w-8 h-8 bg-zinc-600 rounded-full p-1"
                          />
                        )}
                      </div>
                    </span>
                  </div>
                  <h4 className="hidden md:block ">
                    {parse(truncateTitle(video.description, 10))}
                  </h4>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-center m-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 mx-1 bg-gray-300 rounded"
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={` mx-1 ${
              currentPage === index + 1 ? "text-purple-500" : ""
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 mx-1 bg-gray-300 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SearchVideos;

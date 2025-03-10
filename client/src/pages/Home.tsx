import { addVideoToPlaylist } from "../app/api/playListApis";
import { setPlaylist } from "../app/api/slice/playlistSlice";
import { setVideos } from "../app/api/slice/videoSlice";
import { useSelector, useDispatch } from "react-redux";
import VideoCard from "../components/Video/VideoCard";
import { Video } from "../interface/videointerface";
import { getVideos } from "../app/api/videoApi";
import { shuffleArray } from "../utils/format";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import HomeSkeleton from "../components/Skeleton/HomeSkeleton";

const Home = () => {
  const playList = useSelector((state: any) => state.playlist.playLists);
  const user = useSelector((state: any) => state.auth.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [Video, setVideo] = useState<Video[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const videosResponse = await getVideos(currentPage);
        dispatch(setVideos(videosResponse.data.videoInfo));
        setVideo(shuffleArray(videosResponse.data.videoInfo));
        setTotalPages(videosResponse.data.totalPages);
        setIsLoading(false);
      } catch (err: any) {
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, user]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [playlistMenuVisible, setPlaylistMenuVisible] = useState(null);

  const toggleMenu = (videoId: any) => {
    setMenuVisible(menuVisible === videoId ? null : videoId);
    setPlaylistMenuVisible(null);
  };

  const togglePlaylistMenu = (id: any) => {
    setPlaylistMenuVisible((prev) => (prev === id ? null : id));
  };

  const handleAddToPlaylist = async (playlistId: string, videoId: string) => {
    try {
      const response = await addVideoToPlaylist(playlistId, videoId);

      if (response.message === "Video added to playlist successfully") {
        toast.success("Video added to playlist successfully");
      } else if (
        response.message === "Playlist created and video added successfully"
      ) {
        toast.success("Playlist created and video added successfully");
        dispatch(setPlaylist([...playList, response.data]));
      }else if(response.message === "Video already added to playlist"){
        toast.warning("Video already in playlist");
      }
      setPlaylistMenuVisible(null);
      setMenuVisible(null);
    } catch (error) {
      toast.error("Failed to add video to playlist");
    }
  };

  return (
    <div className="w-full h-screen overflow-y-auto ">
      <div className="w-full">
      {isLoading ? (
          <HomeSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full">
            {Video.length === 0 ? (
              <div className="text-center col-span-3 h-screen mt-10 dark:text-white">
              <h2 className="text-2xl font-semibold">No Video Found</h2>
              <p className="text-gray-600">Users has not posted videos yet.</p>
            </div>
            ) : (
              Video.map((video) => (
                <VideoCard
                  playList={playList}
                  video={video}
                  key={video._id}
                  user={user}
                  toggleMenu={() => toggleMenu(video._id)}
                  togglePlaylistMenu={() => togglePlaylistMenu(video._id)}
                  menuVisible={menuVisible}
                  playlistMenuVisible={playlistMenuVisible}
                  handleAddToPlaylist={(playListId: string) =>
                    handleAddToPlaylist(playListId, video._id)
                  }
                />
              ))
            )}
          </div>
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
            className={` mx-1 ${currentPage === index + 1 ? "text-purple-500" : "dark:text-white"
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

export default Home;

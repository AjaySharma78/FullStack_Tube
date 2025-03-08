import { deleteVideo, getUserAllVideos, toggleVideoPublish } from "../app/api/videoApi";
import PublishedVideoSkeleton from "../components/Skeleton/PublishedVideoSkeleton";
import { UserProfileProps } from "../interface/userProfileInterface";
import { addVideoToPlaylist } from "../app/api/playListApis";
import { PlayListProps } from "../interface/playlistprops";
import { Link, useOutletContext } from "react-router-dom";
import VideoCard from "../components/Video/VideoCard";
import { Video } from "../interface/videointerface";
import UpdateImage from "../components/UpdateImage";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PostVideo from "./PostVideo";
import { toast } from "sonner";

const PublishedVideoSection = () => {
  const { playList, setPlayList } = useOutletContext<{ playList: PlayListProps[] | null,setPlayList: React.Dispatch<React.SetStateAction<PlayListProps[] | null>>;}>();
  const { userProfile } = useOutletContext<{ userProfile: UserProfileProps | null }>();
  const [thumbnailVideoId, setThumbnailVideoID] = useState<string | null>(null);
  const [showThumbnaiUpdateCard, setShowThumbnaiUpdateCard] = useState(false);
  const [playlistMenuVisible, setPlaylistMenuVisible] = useState(null);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const user = useSelector((state: any) => state.auth.user);
  const [showEditCard, setshowEditCard] = useState(false);
  const [post, setPost] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const checkUser = userProfile?._id === user?._id;
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const videosResponse = await getUserAllVideos();
        setVideos(videosResponse.data.videoInfo);
        setTotalPages(videosResponse.data.totalPages);
      } catch (err: any) {
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleToggleStatus = async (videoId: string) => {
    toast.promise(
      new Promise<string>(async (resolve, reject) => {
        try {
          const response = await toggleVideoPublish(videoId);
          setVideos((prev) => {
            return prev.map((video) => {
              if (video._id === videoId) {
                return {
                  ...video,
                  isPublished: response.data.isPublished,
                };
              }
              return video;
            });
          });
          resolve(response.message);
          setMenuVisible(null);
        } catch (error) {
          reject("Failed to change video status");
          console.error("Error toggling video status:", error);
        }
      }),
      {
        loading: "Updating video status...",
        success: (message: string) => message,
        error: (message: string) => message,
      }
    );
  };

  const handleAddToPlaylist = async (playlistId: string, videoId: string) => {
    try {
      const response = await addVideoToPlaylist(playlistId, videoId);

      if (response.message === "Video added to playlist successfully") {
        setPlayList(
          (prevPlayList) =>
            prevPlayList?.map((playlist) =>
              playlist._id === response.data._id
                ? {
                    ...playlist,
                    playlistVideos: response.data.playlistVideos,
                  }
                : playlist
            ) || null
        );
        toast.success(response.message);
      } else if (
        response.message === "Playlist created and video added successfully"
      ) {
        setPlayList((prevPlayList) =>
          prevPlayList ? [...prevPlayList, response.data] : [response.data]
        );
        toast.success(response.message);
      }
      setPlaylistMenuVisible(null);
      setMenuVisible(null);
    } catch (error) {
      toast.error("Failed to add video to playlist");
      console.error("Error adding video to playlist:", error);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    toast.promise(
      new Promise<string>(async (resolve, reject) => {
        try {
          const response = await deleteVideo(videoId);
          if (response.message === "Video deleted successfully") {
            setVideos((prev) => prev.filter((video) => video._id !== videoId));
            resolve(response.message);
          }
          setMenuVisible(null);
        } catch (error) {
          reject("Failed to delete video");
          console.error("Error deleting video:", error);
        }
      }),
      {
        loading: "Deleting video...",
        success: (message: string) => message,
        error: (message: string) => message,
      }
    );
  };

  const handleEditVideo = async (vidoeId: string) => {
    setshowEditCard(!showEditCard);
    setMenuVisible(null);
    const videoInfo = videos.find((video) => video._id === vidoeId);
    if (videoInfo) {
      setPost(videoInfo);
    }
  };

  const handleUpdateThumbnail = (videoId: string) => {
    setThumbnailVideoID(videoId);
    setShowThumbnaiUpdateCard(!showThumbnaiUpdateCard);
    setMenuVisible(null);
  };

  const toggleMenu = (videoId: any) => {
    setMenuVisible(menuVisible === videoId ? null : videoId);
    setPlaylistMenuVisible(null);
  };

  const togglePlaylistMenu = (id: any) => {
    setPlaylistMenuVisible((prev) => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
     <PublishedVideoSkeleton />
    );
  }
  return (
    <div className="relative">
      <div
        onClick={() => setMenuVisible(null)}
        className={`absolute w-full h-full  ${
          menuVisible ? "bg-black/50" : "hidden"
        }`}
      ></div>
      {showEditCard && (
        <div className=" fixed inset-0 bg-opacity-30  backdrop-blur-sm flex justify-center items-center z-50">
          <PostVideo
            post={post}
            showEditCard={showEditCard}
            handleEditVideo={handleEditVideo}
          />
        </div>
      )}
      {showThumbnaiUpdateCard && (
        <UpdateImage
          videoId={thumbnailVideoId}
          handleUpdateImage={() =>
            handleUpdateThumbnail && handleUpdateThumbnail("")
          }
          setItems={setVideos}
          type="thumbnail"
        />
      )}
      <section className="w-full h-full py-5 px-2 md:px-5 overflow-auto">
        <div className="grid md:grid-cols-3 gap-2 md:gap-5">
          {videos ? (
            videos.map((video) => (
              <VideoCard
                key={video._id}
                menuVisible={menuVisible}
                playlistMenuVisible={playlistMenuVisible}
                isPublishedPage={true}
                toggleMenu={() => toggleMenu(video._id)}
                togglePlaylistMenu={() => togglePlaylistMenu(video._id)}
                playList={playList}
                handleToggleStatus={() => handleToggleStatus(video._id)}
                handleAddToPlaylist={(playlistId: string) =>
                  handleAddToPlaylist(playlistId, video._id)
                }
                handleDeleteVideo={() => handleDeleteVideo(video._id)}
                handleEditVideo={() => handleEditVideo(video._id)}
                handleUpdateThumbnail={() => handleUpdateThumbnail(video._id)}
                checkUser={checkUser}
                video={video}
                user={user}
                userProfile={userProfile}
              />
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500">
             Not poasted any video yet. Upload a video to see it here...{" "}
             <Link to="/upload-video" className="text-blue-500  underline">
                Upload
              </Link>
            </div>
          )}
        </div>
      </section>
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

export default PublishedVideoSection;

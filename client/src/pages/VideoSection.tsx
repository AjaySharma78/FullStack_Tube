import { UserProfileProps } from "../interface/userProfileInterface";
import { addVideoToPlaylist } from "../app/api/playListApis";
import { PlayListProps } from "../interface/playlistprops";
import { Link, useOutletContext } from "react-router-dom";
import VideoCard from "../components/Video/VideoCard";
import { useSelector } from "react-redux";
import { useState } from "react";
import { toast } from "sonner";

const VideoSection = () => {
  const { playList, setPlayList } = useOutletContext<{
    playList: PlayListProps[] | null;
    setPlayList: React.Dispatch<React.SetStateAction<PlayListProps[] | null>>;
  }>();
  const { userProfile } = useOutletContext<{
    userProfile: UserProfileProps | null;
  }>();
  const [playlistMenuVisible, setPlaylistMenuVisible] = useState(null);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const user = useSelector((state: any) => state.auth.user);
  const checkUser = userProfile?._id === user?._id;

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
        toast.success("Video added to playlist successfully");
      } else if (
        response.message === "Playlist created and video added successfully"
      ) {
        setPlayList((prevPlayList) =>
          prevPlayList ? [...prevPlayList, response.data] : [response.data]
        );
        toast.success("Playlist created and video added successfully");
      } else if (response.message === "Video already added to playlist") {
        toast.warning("Video already in playlist");
      }
      setPlaylistMenuVisible(null);
      setMenuVisible(null);
    } catch (error) {
      toast.error("Error adding video to playlist");
      console.error("Error adding video to playlist:", error);
    }
  };

  return (
    <div className="relative">
      <div
        onClick={() => setMenuVisible(null)}
        className={`absolute w-full h-full  ${
          menuVisible ? "bg-black/50" : "hidden"
        }`}
      ></div>
      <section className={`w-full h-full py-5 px-2 md:px-5 overflow-auto`}>
        <div className={`grid md:grid-cols-3 gap-2 md:gap-5`}>
          {userProfile?.videos?.length ?? 0 > 0 ? (
            userProfile?.videos.map((video) => (
              <VideoCard
                playList={playList}
                isPublishedPage={false}
                checkUser={checkUser}
                key={video._id}
                video={video}
                user={user}
                userProfile={userProfile}
                toggleMenu={() => toggleMenu(video._id)}
                togglePlaylistMenu={() => togglePlaylistMenu(video._id)}
                menuVisible={menuVisible}
                playlistMenuVisible={playlistMenuVisible}
                handleAddToPlaylist={(playlistId: string) =>
                  handleAddToPlaylist(playlistId, video._id)
                }
              />
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500">
              Publish your first video......{" "}
              <Link to="/upload-video" className="text-blue-500 underline">
                Upload
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VideoSection;

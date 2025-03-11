import { IoMdClose } from "react-icons/io";
import { PlayListProps } from "../../interface/playlistprops";
import { UserProps } from "../../interface/sliceInterface";
import { Video } from "../../interface/videointerface";
import {
  encryptData,
  formatCount,
  formatDuration,
  formatWhenPosted,
  truncateTitle,
} from "../../utils/format";
import { Link } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useState } from "react";
interface VideoLinkProps {
  video: Video;
  checkUser?: boolean;
  user: UserProps | null;
  playlistOwnerId: string | null;
  playlistId: string | null;
  matchedPlaylist?: PlayListProps | null;
  menuVisible?: string | null;
  menuVisiblePlaylist?: string | null;
  toggleMenu?: () => void;
  toggleMenuPlaylist?: () => void;
  playlistStatus?: boolean;
  playlistMenuVisible?: boolean | null;
  playList?: PlayListProps[] | null;
  togglePlaylistMenu?: () => void;
  handleAddToPlaylist?: (playlistId: string, videoId: string) => void;
  handleRemoveFromPlaylist?: (playlistId: string, videoId: string) => void;
}

const VideoSmallCard: React.FC<VideoLinkProps> = ({
  video,
  playList,
  user,
  playlistOwnerId,
  checkUser,
  playlistId,
  matchedPlaylist,
  menuVisible,
  toggleMenu,
  menuVisiblePlaylist,
  toggleMenuPlaylist,
  playlistStatus,
  playlistMenuVisible,
  togglePlaylistMenu,
  handleAddToPlaylist,
  handleRemoveFromPlaylist,
}) => {
  const [isVideo, setIsVideo] = useState(true);
  const encryptedVideoId = encryptData(video._id);
const encryptedUserId = encryptData(user ? user._id : null);
const encryptedPlaylistOwnerId = encryptData(playlistOwnerId && playlistOwnerId !== "null" ? playlistOwnerId : null);
const encryptedPlaylistId = encryptData(playlistId ? playlistId : null);

  return (
    <div key={video._id}>
      <div key={video._id} className="bg-gray-200 dark:bg-zinc-800 p-2 shadow-md flex w-full">
        <Link
         to={`/videos/${encryptedVideoId}/${encryptedUserId}/${encryptedPlaylistOwnerId}/${encryptedPlaylistId}`}
          className="w-[35%] md:w-[50%] h-20 md:h-28 relative group"
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover rounded-md group-hover:hidden"
          />
           {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-zinc-700 rounded-md" >
                <img
                  src="https://media.tenor.com/wpSo-8CrXqUAAAAi/loading-loading-forever.gif"
                  alt="loading"
                  style={{ width: "30px" }}
                />
              </div>
            )}
          <video
            className="w-full h-full object-cover rounded-md absolute top-0 left-0 hidden group-hover:block"
            onMouseEnter={(e) => {
              e.currentTarget.play();
              e.currentTarget.playbackRate =2;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
            }}
            preload="auto"
            muted={true}
            loop={true}
            onLoadedData={() => setIsVideo(false)}
          >
            <source src={video.videoFile} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-.5 rounded group-hover:hidden">
            {formatDuration(video.duration)}
          </div>
        </Link>
        <div className="w-[80%] md:w-[50%] flex justify-between items-start p-2">
          <div className="w-full flex flex-col items-start justify-around h-full">
            <h3 className="text-xs md:text-base">
              <b>{truncateTitle(video.title)}</b>
            </h3>
            <div>
              <p className="text-[10px] md:text-xs text-gray-600 font-medium">
                {matchedPlaylist
                  ? matchedPlaylist.playlistOwner.fullName
                  : video.videoOwner.fullName}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500 font-medium">
                {formatCount(video.views)} views |{" "}
                {formatWhenPosted(video.createdAt)}
              </p>
            </div>
          </div>
          <div className="relative z-20">
           {user?( <button
              onClick={playlistStatus ? toggleMenuPlaylist : toggleMenu}
              className="text-blue-500 py-2 text-x"
            >
              {(
               playlistStatus
                  ? menuVisiblePlaylist === video._id
                  : menuVisible === video._id
              ) ? (
                <IoMdClose />
              ) : (
                <BsThreeDotsVertical />
              )}
            </button>):null}
            { checkUser && menuVisiblePlaylist === video._id ? (
                <div className="absolute right-0 bottom-8 mr-5 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-[1]">
                  <button
                    onClick={() => handleRemoveFromPlaylist && handleRemoveFromPlaylist('', video._id)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Remove from Playlist
                  </button>
                  
                </div>
              ): menuVisible === video._id ? (
                  <div className="absolute right-0 top-0 mr-5 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-[1]">
                    <button
                      onClick={togglePlaylistMenu}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Add to Playlist
                    </button>
                    <button
                      onClick={()=>  handleAddToPlaylist && handleAddToPlaylist('',video._id)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Add to New Playlist
                    </button>
                    {playlistMenuVisible && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                        {playList?.map((playlist) => (
                          <button
                            key={playlist._id}
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToPlaylist &&
                                handleAddToPlaylist(playlist._id, video._id);
                              
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200"
                          >
                            {truncateTitle(playlist.name,4)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ):null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSmallCard;

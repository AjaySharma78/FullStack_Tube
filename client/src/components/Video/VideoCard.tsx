import { Link } from "react-router-dom";
import {
  formatDuration,
  formatDate,
  formatViews,
  truncateTitle,
} from "../../utils/format";
import { Video } from "../../interface/videointerface";
import { UserProps } from "../../interface/sliceInterface";
import { UserProfileProps } from "../../interface/userProfileInterface";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { PlayListProps } from "../../interface/playlistprops";
import { encryptData } from "../../utils/format";
import Sound from "../../assets/sound.png";
import Mute from "../../assets/mute.png";
import parse from "html-react-parser";
import { useState } from "react";
interface VideoCardProps {
  video: Video;
  user: UserProps | null;
  userProfile?: UserProfileProps | null;
  checkUser?: boolean;
  handleToggleStatus?: () => void;
  handleAddToPlaylist?: (playlistId: string, videoId: string) => void;
  playList?: PlayListProps[] | null;
  toggleMenu: () => void;
  togglePlaylistMenu: () => void;
  handleDeleteVideo?: () => void;
  menuVisible: string | null;
  playlistMenuVisible: boolean | null;
  isPublishedPage?: boolean;
  handleEditVideo?: () => void;
  handleUpdateThumbnail?: () => void;
  isWatchHistoryPage?: boolean;
}
const VideoCard: React.FC<VideoCardProps> = ({
  video,
  user,
  userProfile,
  checkUser,
  handleToggleStatus,
  playList,
  handleAddToPlaylist,
  toggleMenu,
  togglePlaylistMenu,
  menuVisible,
  playlistMenuVisible,
  isPublishedPage,
  handleDeleteVideo,
  handleEditVideo,
  handleUpdateThumbnail,
  isWatchHistoryPage,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const encryptedVideoId = encryptData(video._id);
  const encryptedUserId = encryptData(user ? user._id : null);
  const encryptedPlaylistOwnerId = encryptData(null);
  const [muted, setMuted] = useState(true);

  const handleMute = () => {
    setMuted(!muted);
  };

  return (
    <div
      key={video._id}
      className={`bg-gray-200 relative dark:bg-zinc-800 rounded-t-md md:rounded-lg shadow-md flex flex-col w-full dark:text-zinc-300`}
    >
      <div
        className={`w-full ${
          isWatchHistoryPage ? "h-20 md:h-44" : "h-44 md:h-52"
        } relative group ${menuVisible ? "pointer-events-none" : ""}`}
      >
        <Link
          to={`/videos/${encryptedVideoId}/${encryptedUserId}/${encryptedPlaylistOwnerId}`}
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className={`w-full h-full object-cover rounded-md ${
              isWatchHistoryPage ? "cursor-grab" : "group-hover:hidden"
            }`}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-zinc-600 rounded-md">
              <img
                src="https://media.tenor.com/wpSo-8CrXqUAAAAi/loading-loading-forever.gif"
                alt="loading"
                style={{ width: "30px" }}
              />
            </div>
          )}

          <video
            className={`w-full h-full object-cover rounded-t-lg absolute top-0 left-0 ${
              isWatchHistoryPage ? "hidden" : " hidden group-hover:block"
            }`}
            {...(!userProfile && {
              onMouseEnter: (e) => {
                const videoElement = e.currentTarget;
                if (isFinite(videoElement.duration)) {
                  videoElement.play();
                  // const randomStartTime = videoElement.duration / 2;
                  // videoElement.currentTime = randomStartTime;
                }
              },
            })}
            {...(userProfile && {
              onMouseEnter: (e) => {
                e.currentTarget.play();
                e.currentTarget.playbackRate = 2;
              },
            })}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              setMuted(true);
            }}
            {...(!userProfile && {
              onTimeUpdate: (e) => {
                const videoElement = e.currentTarget;
                const remainingTime =
                  videoElement.duration - videoElement.currentTime;
                const durationElement = videoElement.nextElementSibling;
                if (durationElement) {
                  durationElement.textContent = formatDuration(
                    Math.round(remainingTime)
                  );
                }
              },
            })}
            onLoadedData={() => setIsLoading(false)}
            muted={muted ? true : false}
          >
            <source src={video.videoFile} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Link>
        <div
          className={`absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-.5 rounded ${
            userProfile ? "group-hover:hidden" : ""
          }`}
        >
          {formatDuration(video.duration)}
        </div>
        {user && isPublishedPage && (
          <div
            className={`absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-.5 rounded ${
              userProfile ? "group-hover:hidden" : ""
            }`}
          >
            {video.isPublished ? "Published" : "Not Published"}
          </div>
        )}
        
       {!userProfile && <div
          onClick={handleMute}
          className="absolute right-1 top-2 cursor-pointer w-15 h-15 hidden group-hover:block p-1 z-50 "
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
        </div>}

      </div>

      <div
        className={`flex justify-between items-center p-1 ${
          isWatchHistoryPage ? "lg:h-20" : "h-20"
        }`}
      >
        <Link
          to={`/user/@${
            userProfile ? userProfile.userName : video.videoOwner.userName
          }`}
          className={`flex items-center justify-center ${
            isWatchHistoryPage ? "w-1/4 hidden lg:block " : "w-[70px] lg:w-1/4"
          } h-full`}
        >
          <img
            src={userProfile ? userProfile.avatar : video.videoOwner.avatar}
            alt="avatar"
            className={`w-[60px] h-[60px] object-cover rounded-full`}
          />
        </Link>
        <div className="flex flex-col justify-center items-start w-4/5 h-full px-1 py-1 md:px-2">
          <h3>
            <b
              className={`${
                isWatchHistoryPage ? "text-xs md:text-base" : ""
              } line-clamp-1 text-xs md:text-base`}
            >
              {truncateTitle(video.title, isWatchHistoryPage ? 3 : 4)}
            </b>
          </h3>
          <div
            className={`${
              isWatchHistoryPage
                ? "text-xs hidden lg:block"
                : "text-xs md:text-sm "
            } line-clamp-1 w-full`}
          >
            {parse(truncateTitle(video.description, 3))}
          </div>
          <div
            className={`${
              isWatchHistoryPage
                ? "text-[8px] md:text-[9px]"
                : "text-[9px] md:text-xs"
            } text-gray-500 font-medium`}
          >
            {userProfile ? "" : `${video.videoOwner.fullName} |`}{" "}
            {formatViews(video.views)} views | {formatDate(video.createdAt)}
          </div>
        </div>
        {user && (
          <div className="relative z-[1] ">
            <button onClick={toggleMenu} className="text-blue-500 py-2 text-x">
              {menuVisible === video._id ? (
                <IoMdClose />
              ) : (
                <BsThreeDotsVertical />
              )}
            </button>
            {menuVisible === video._id && (
              <div className="absolute right-0 bottom-8 mr-5 w-48 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-500 rounded-md shadow-lg">
                {checkUser && isPublishedPage && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleStatus && handleToggleStatus();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700  dark:text-zinc-400 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 border-b border-gray-300 dark:border-zinc-500"
                    >
                      {video.isPublished ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteVideo && handleDeleteVideo();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700  dark:text-zinc-400 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 border-b border-gray-300 dark:border-zinc-500"
                    >
                      Delete Video
                    </button>
                    <button
                      onClick={handleEditVideo}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700  dark:text-zinc-400 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 border-b border-gray-300 dark:border-zinc-500"
                    >
                      Update title & desc..{" "}
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateThumbnail && handleUpdateThumbnail()
                      }
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700  dark:text-zinc-400 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 border-b border-gray-300 dark:border-zinc-500"
                    >
                      Update thumbnail{" "}
                    </button>
                  </>
                )}
                {playList && playList.length <= 0 ? (
                  ""
                ) : (
                  <button
                    onClick={() =>
                      playList && playList.length <= 0
                        ? ""
                        : togglePlaylistMenu()
                    }
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700  dark:text-zinc-400 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 border-b border-gray-300 dark:border-zinc-500"
                  >
                    Add to Playlist
                  </button>
                )}
                <button
                  onClick={() =>
                    handleAddToPlaylist && handleAddToPlaylist("", video._id)
                  }
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700  dark:text-zinc-400 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 border-b border-gray-300 dark:border-zinc-500"
                >
                  Add to New Playlist
                </button>
                {playlistMenuVisible && (
                  <div className="absolute right-0 mt-2 w-48 bg-white  dark:bg-zinc-800 dark:border-zinc-500 border border-gray-300 rounded-md shadow-lg ">
                    {playList?.map((playlist) => (
                      <button
                        key={playlist._id}
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToPlaylist &&
                            handleAddToPlaylist(playlist._id, video._id);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-700 rounded-md hover:bg-gray-200 border-b border-gray-300 dark:border-zinc-500"
                      >
                        {truncateTitle(playlist.name, 4)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;

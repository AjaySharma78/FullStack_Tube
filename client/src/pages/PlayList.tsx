import { deleteAllVideoFromPlaylist, deletePlaylist } from "../app/api/playListApis";
import { UserProfileProps } from "../interface/userProfileInterface";
import { useNavigate, useOutletContext } from "react-router-dom";
import { setPlaylist } from "../app/api/slice/playlistSlice";
import { PlayListProps } from "../interface/playlistprops";
import { useDispatch, useSelector } from "react-redux";
import { BsThreeDotsVertical } from "react-icons/bs";
import { encryptData, truncateTitle } from "../utils/format";
import { CgPlayList } from "react-icons/cg";
import { IoMdClose } from "react-icons/io";
import { useState } from "react";
import { toast } from "sonner";

const PlayList = () => {
  const { playList, setPlayList } = useOutletContext<{ playList: PlayListProps[] | null; setPlayList: React.Dispatch<React.SetStateAction<PlayListProps[] | null>>; }>();
  const { userProfile } = useOutletContext<{ userProfile: UserProfileProps | null; }>();
  const slicePlaylists = useSelector((state: any) => state.playlist.playLists);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const user = useSelector((state: any) => state.auth.user);
  const checkUser = userProfile?._id === user?._id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlePlayListClick = (playList: PlayListProps) => {
    const userIdPart = user && user._id ? `${user._id}` : "null";

    const encryptedVideoId = encryptData(playList.playlistVideos[0]._id);
    const encryptedUserId = encryptData(userIdPart);
    const encryptedPlaylistOwnerId = encryptData(playList.playlistOwner._id);
    const encryptedPlaylistId = encryptData(playList._id);

    navigate(
       `/videos/${encryptedVideoId}/${encryptedUserId}/${encryptedPlaylistOwnerId}/${encryptedPlaylistId}`
    );
  };

  const handleDeleteAllVideos = async (playlistId: string) => {
    try {
      const response = await deleteAllVideoFromPlaylist(playlistId);
      if (
        response.message === "All Videos removed from playlist successfully"
      ) {
        setPlayList(
          (prevPlayList) =>
            prevPlayList?.map((playlist) =>
              playlist._id === playlistId
                ? {
                  ...playlist,
                  playlistVideos: [],
                }
                : playlist
            ) || null
        );
        toast.success(response.message);
      }
    } catch (error) {
      toast.error("Error deleting all videos from playlist");
      console.error("Error deleting all videos from playlist:", error);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      const response = await deletePlaylist(playlistId);
      if (response.message === "Playlist deleted successfully") {
        setPlayList(
          (prevPlayList) =>
            prevPlayList?.filter(
              (playlist) => playlist._id !== response.data._id
            ) || null
        );

        dispatch(
          setPlaylist(
            slicePlaylists.filter(
              (playlist: PlayListProps) => playlist._id !== response.data._id
            )
          )
        );
        toast.success(response.message);
      }
    } catch (error) {
      toast.error("Error deleting playlist");
      console.error("Error deleting playlist:", error);
    }
  };

  const getRandomColor = (id: string) => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[(id.charCodeAt(i % id.length) + i) % 16];
    }
    return color;
  };

  const toggleMenu = (playlistId: string) => {
    setMenuVisible(menuVisible === playlistId ? null : playlistId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 px-2 md:px-5 py-5 ">
    {playList && playList.length > 0 ? (
      playList?.map((playList) => (
        <div
          key={playList._id}
          className="w-full cursor-pointer flex flex-col border-b border-gray-500 rounded-lg "
        >
          <div
            className="w-full text-center rounded-lg"
            onClick={
              playList.playlistVideos.length > 0
                ? () => handlePlayListClick(playList)
                : () => { }
            }
          >
            {playList.playlistVideos[0]?.thumbnail ? (
              <div className="relative group">
                <img
                  src={playList.playlistVideos[0].thumbnail}
                  alt="thumbnail"
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="flex px-1 py-0.5 absolute bottom-2 right-2 bg-black bg-opacity-70 text-white dark:text-zinc-400 rounded group-hover:hidden">
                  <CgPlayList className="mt-0.5" />{" "}
                  <span className="text-xs">
                    {playList.playlistVideos.length} Videos
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="w-full h-48 flex items-center justify-center rounded-t-lg"
                style={{ backgroundColor: getRandomColor(playList._id) }}
              >
                <span className="text-7xl font-bold text-white">
                  {playList.name.charAt(0).toLocaleUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="p-2 flex justify-between items-center dark:text-zinc-400">
            <div>
              <h3 className="font-semibold">
                {truncateTitle(
                  playList.name.charAt(0).toLocaleUpperCase() +
                  playList.name.slice(1),
                  5
                )}
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">View full Playlist</p>
            </div>

            {checkUser && (
              <div className="relative z-20">
                <button
                  onClick={() => toggleMenu(playList._id)}
                  className="text-blue-500 py-2 text-x"
                >
                  {menuVisible === playList._id ? (
                    <IoMdClose />
                  ) : (
                    <BsThreeDotsVertical />
                  )}
                </button>
                {menuVisible === playList._id && (
                  <div className="absolute right-0 bottom-8 mr-5 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteAllVideos(playList._id);
                        setMenuVisible(null);
                      }}
                      className={`${playList.playlistVideos.length === 0
                          ? "hidden"
                          : "block"
                        } w-full text-left px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200`}
                    >
                      Delete All Videos
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeletePlaylist(playList._id);
                        setMenuVisible(null);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200`}
                    >
                      Delete Playlist
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))) : (
        <div className="col-span-4 text-center text-gray-500">
          Playlist is empty. Add videos to playlist..
        </div>
      )}
    </div>
  );
};

export default PlayList;

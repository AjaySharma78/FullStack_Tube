import { setPlaylist, setPlaylistVideos } from "../app/api/slice/playlistSlice";
import { IoMdNotificationsOff, IoMdNotificationsOutline } from "react-icons/io";
import { toggleVideoLike, toggleCommentLike } from "../app/api/likeApis";
import VideoPageSkeleton from "../components/Skeleton/VideoPageSkeleton";
import { PlayListProps, VideoProps } from "../interface/playlistprops";
import { currentPlaylistVideos } from "../app/api/slice/playlistSlice";
import { getVideo, increaseVideoViews } from "../app/api/videoApi";
import { selectCurrentStatus } from "../app/api/slice/authSlice";
import VideoSmallCard from "../components/Video/VideoSmallCard";
import CommentForm from "../components/Comment/CommentForm";
import CommentCard from "../components/Comment/CommentCard";
import { currentVideos } from "../app/api/slice/videoSlice";
import { toggleSubscribe } from "../app/api/subscribeApi";
import { Comment } from "../interface/commentinterface";
import { useSelector, useDispatch } from "react-redux";
import { BsCollectionPlayFill } from "react-icons/bs";
import { Video } from "../interface/videointerface";
import VideoPlayer from "../components/VideoPlayer";
import { MdOutlinePersonPin } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import { decryptData } from "../utils/format";
import Button from "../components/Button";
import parse from "html-react-parser";
import "video.js/dist/video-js.css";
import videojs from "video.js";
import { toast } from "sonner";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  userPlaylist,
} from "../app/api/playListApis";
import {
  FaShare,
  FaRegThumbsUp,
  FaRegThumbsDown,
  FaThumbsUp,
  FaThumbsDown,
} from "react-icons/fa";
import {
  formatWhenPosted,
  formatCount,
  formatDate,
  truncateTitle,
  addComman,
} from "../utils/format";
import {
  getVideoComments,
  postVideoComment,
  updateVideoComment,
  deleteVideoComment,
} from "../app/api/commentApis";

import {
  toggleVideoDislike,
  toggleCommentDislike,
} from "../app/api/dislikeApis";


function VideoPage() {
  const { videoId: encryptedVideoId, userId: encryptedUserId, playlistOwnerId: encryptedPlaylistOwnerId, playlistId: encryptedPlaylistId } = useParams<{
    videoId: string;
    userId: string;
    playlistOwnerId: string;
    playlistId?: string;
  }>();

  const videoId = decryptData(encryptedVideoId);
  const userId = decryptData(encryptedUserId);
  const playlistOwnerId = decryptData(encryptedPlaylistOwnerId);
  const playlistId = encryptedPlaylistId ? decryptData(encryptedPlaylistId) : null;
  const [menuVisiblePlaylist, setMenuVisiblePlaylist] = useState<string | null>(null);
  const [matchedPlaylist, setMatchedPlaylist] = useState<PlayListProps | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const playList = useSelector((state: any) => state.playlist.playLists);
  const [playlistMenuVisible, setPlaylistMenuVisible] = useState(null);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [videoInfo, setVideoInfo] = useState<Video | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLikeHovered, setIsLikeHovered] = useState(false);
  const [isdetailsOpen, setIsDetailsOpen] = useState(false);
  const user = useSelector((state: any) => state.auth.user);
  const [newComment, setNewComment] = useState<string>("");
  const storePlayList = useSelector(currentPlaylistVideos);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const authStatus = useSelector(selectCurrentStatus);
  const [checkUser, setCheckUser] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const storeVideos = useSelector(currentVideos);
  const videoLink = videoInfo?.videoFile;
  const playerRef = useRef<any>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (videoId) {
        try {
          const videoResponse = await getVideo(
            videoId,
            userId ? userId : "null"
          );
          const viewResponse = await increaseVideoViews(videoId);
          const response = await getVideoComments(
            videoId,
            userId ? userId : "null"
          );
          const sortComment = response.data;
          sortComment.sort((a: Comment) =>
            a.commentOwner._id === user?._id ? -1 : 1
          );
          setComments(sortComment);
          setVideoInfo(videoResponse.data);
          if (viewResponse) {
            setVideoInfo((prev) => {
              if (prev) {
                return {
                  ...prev,
                  views: prev.views + 1,
                };
              }
              return prev;
            });
          }
          if (matchedPlaylist) {
            const currentIndex = matchedPlaylist.playlistVideos.findIndex(
              (v: any) => v._id === videoId
            );
            const checkUser = matchedPlaylist?.playlistOwner._id === user?._id;
            setCheckUser(checkUser);
            setCurrentVideoIndex(currentIndex + 1);
          }

          if (videoContainerRef.current) {
            videoContainerRef.current.scrollIntoView({ behavior: "instant" });
          }
        } catch (err: any) {
          toast.error("Something went wrong.Try again later...");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [videoId, currentVideoIndex]);
  useLayoutEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (playlistOwnerId && playlistOwnerId !== "null") {
          const playlistResponse = await userPlaylist(playlistOwnerId);
          const playlists = playlistResponse.data;
          const matchedPlaylist = playlists.find(
            (playlist: any) => playlist._id === playlistId
          );
          if (matchedPlaylist) {
            dispatch(setPlaylistVideos(matchedPlaylist.playlistVideos));
            setMatchedPlaylist(matchedPlaylist);
            const currentIndex = matchedPlaylist.playlistVideos.findIndex(
              (v: any) => v._id === videoId
            );
            setCurrentVideoIndex(currentIndex + 1);
          }
          const checkUser = matchedPlaylist?.playlistOwner._id === user?._id;
          setCheckUser(checkUser);
        }
      } catch (err: any) {
        toast.error("Something went wrong.Try again later...");
      }
    };
    fetchData();
  }, []);
  const videoPlayerOptions = useMemo(
    () => ({
      controls: true,
      responsive: true,
      fluid: true,
      preload: "auto",
      autoplay: true,
      poster: videoInfo?.thumbnail,
      playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      suppressNotSupportedError: true,
      experimentalSvgIcons: true,
      enableSmoothSeeking: true,
      controlBar: {
        skipButtons: {
          backward: 30,
          forward: 10,
        },
      volumePanel: {
          inline: false,
        },
      },
      sources: [
        {
          src: videoLink,
          // type: "application/x-mpegURL",
          type: "video/mp4",

        },
      ],
    }),
    [videoLink, videoInfo?.thumbnail]
  );
  const handlePlayerReady = useCallback((player: any) => {
    playerRef.current = player;
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });
    player.on("dispose", () => {
      videojs.log("player disposed");
    });

    player.on("contextmenu", (e:Event) => {
      e.preventDefault();
    }
    );

    const handleArrowKeys = (event: any) => {
      if (event.code === "ArrowRight") {
        event.preventDefault();
        if (playerRef.current) {
          playerRef.current.currentTime(playerRef.current.currentTime() + 5);
        }
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        if (playerRef.current) {
          playerRef.current.currentTime(playerRef.current.currentTime() - 5);
        }
      }
    };

    const handleSpaceBar = (event: any) => {
      if (event.code === "Space" && event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA") {
        event.preventDefault();
        if (playerRef.current) {
          playerRef.current.paused()
            ? playerRef.current.play()
            : playerRef.current.pause();
        }
      }
    };

    const handleMute = (event: any) => {
      if (event.code === "KeyM" && event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA") {
        event.preventDefault();
        if (playerRef.current) {
          playerRef.current.muted(!playerRef.current.muted());
        }
      }
    }

    document.addEventListener("keydown", handleArrowKeys);
    document.addEventListener("keydown", handleSpaceBar);
    document.addEventListener("keydown", handleMute);

    return () => {
      document.removeEventListener("keydown", handleArrowKeys);
      document.removeEventListener("keydown", handleSpaceBar);
      document.removeEventListener("keydown", handleMute);
    };

  }, []);
  const toggleMenu = (playlistId: string) => {
    setMenuVisible(menuVisible === playlistId ? null : playlistId);
    setPlaylistMenuVisible(null);
  };
  const toggleMenuPlaylist = (playlistId: string) => {
    setMenuVisiblePlaylist(
      menuVisiblePlaylist === playlistId ? null : playlistId
    );
  };
  const togglePlaylistMenu = (id: any) => {
    setPlaylistMenuVisible((prev) => (prev === id ? null : id));
  };
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: videoInfo?.title,
          text: videoInfo?.description,
          url: window.location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      toast.warning("Share API is not supported in your browser.");
    }
  };
  const handleSubscribeClick = async () => {
    toast.promise(
      new Promise<string>(async (resolve, reject) => {
        try {
          const response = await toggleSubscribe(`${videoInfo?.videoOwner._id}`);
          if (!response.data) return;
          resolve(response.message);
          setVideoInfo((prev) => {
            if (prev) {
              return {
                ...prev,
                videoOwner: {
                  ...prev.videoOwner,
                  isSubscribed: !prev.videoOwner.isSubscribed,
                },
              };
            }
            return prev;
          });
        } catch (err) {
          reject("Request failed try again later");
        }
      }),
      {
        loading: "Processing...",
        success: (msg: string) => msg,
        error: (msg: string) => msg,
      }
    );
  };
  const handleVideoLike = async (videoId: string) => {
    try {
      const response = await toggleVideoLike(videoId);
      const message = response.message;
      if (message === "Video liked successfully") {
        setVideoInfo((prev) => {
          if (prev) {
            if (prev.isDisliked) {
              return {
                ...prev,
                isDisliked: false,
                numberoflikes: (prev.numberoflikes ?? 0) + 1,
                isLiked: true,
              };
            }
            return {
              ...prev,
              isLiked: true,
              numberoflikes: (prev.numberoflikes ?? 0) + 1,
            };
          }
          return prev;
        });
      } else if (message === "Video unliked successfully") {
        setVideoInfo((prev) => {
          if (prev) {
            return {
              ...prev,
              isLiked: false,
              numberoflikes: (prev.numberoflikes ?? 0) - 1,
            };
          }
          return prev;
        });
      }
    } catch (error) {
      toast.error("Something went wrong while liking the video");
    }
  };
  const handleVideoDislike = async (videoId: string) => {
    try {
      const response = await toggleVideoDislike(videoId);
      const message = response.message;
      if (message === "Video Disliked successfully") {
        setVideoInfo((prev) => {
          if (prev) {
            if (prev.isLiked) {
              return {
                ...prev,
                isLiked: false,
                numberoflikes: (prev.numberoflikes ?? 0) - 1,
                isDisliked: true,
              };
            }
            return {
              ...prev,
              isDisliked: true,
            };
          }
          return prev;
        });
      } else if (message === "Video unliked successfully") {
        setVideoInfo((prev) => {
          if (prev) {
            return {
              ...prev,
              isDisliked: false,
            };
          }
          return prev;
        });
      }
    } catch (error) {
      toast.error("Something went wrong while disliking the video");
    }
  };
  const handleVideoCommentLike = async (commentId: string) => {
    try {
      const response = await toggleCommentLike(commentId);
      const message = response.message;
      if (message === "Video comment liked successfully") {
        setComments((prev) => {
          if (prev) {
            return prev.map((comment) => {
              if (comment._id === commentId) {
                if (comment.isDisliked) {
                  return {
                    ...comment,
                    isDisliked: false,
                    likesCount: comment.likesCount + 1,
                    isLiked: true,
                  };
                }
                return {
                  ...comment,
                  isLiked: true,
                  likesCount: comment.likesCount + 1,
                };
              }
              return comment;
            });
          }
          return prev;
        });
      } else if (message === "Video comment unliked successfully") {
        setComments((prev) => {
          if (prev) {
            return prev.map((comment) => {
              if (comment._id === commentId) {
                return {
                  ...comment,
                  isLiked: false,
                  likesCount: comment.likesCount - 1,
                };
              }
              return comment;
            });
          }
          return prev;
        });
      }
    } catch (error) {
      toast.error("Something went wrong while liking the comment");
    }
  };
  const handleVideoCommentDislike = async (commentId: string) => {
    try {
      const response = await toggleCommentDislike(commentId);
      const message = response.message;
      if (message === "Video Comment Disliked successfully") {
        setComments((prev) => {
          if (prev) {
            return prev.map((comment) => {
              if (comment._id === commentId) {
                if (comment.isLiked) {
                  return {
                    ...comment,
                    isLiked: false,
                    likesCount: comment.likesCount - 1,
                    isDisliked: true,
                  };
                }
                return {
                  ...comment,
                  isDisliked: true,
                };
              }
              return comment;
            });
          }
          return prev;
        });
      } else if (message === "Video Comment unliked successfully") {
        setComments((prev) => {
          if (prev) {
            return prev.map((comment) => {
              if (comment._id === commentId) {
                return {
                  ...comment,
                  isDisliked: false,
                };
              }
              return comment;
            });
          }
          return prev;
        });
      }
    } catch (error) {
      toast.error("Something went wrong while disliking the comment");
    }
  };
  const handleCommentPost = async (videoId: string) => {
    toast.promise(
      new Promise<string>(async (resolve, reject) => {
        try {
          const response = await postVideoComment(videoId, newComment);
          if (!response.success) reject(response.message);
          resolve("Comment Posted...");
          setComments((prev) => prev && [response.data, ...prev]);
          setNewComment("");
          setShowEmojiPicker(false);
        } catch (error) {
          reject("Something went wrong while posting the comment");
        }
      }
      ),
      {
        loading: "Posting comment...",
        success: (message: string) => message,
        error: (message: string) => message,
      }
    )
  };
  const handleCommentUpdate = async (commentId: string) => {
    toast.promise(
      new Promise<string>(async (resolve, reject) => {
        try {
          const response = await updateVideoComment(commentId, editingCommentText);
          if (!response.success) reject(response.message);
          resolve("Comment Updated...");
          setComments(
            (prev) =>
              prev &&
              prev.map((comment) =>
                comment._id === commentId
                  ? { ...comment, content: response.data.content }
                  : comment
              )
          );
          setEditingCommentId(null);
          setEditingCommentText("");
        } catch (error) {
          reject("Something went wrong while updating the comment");
        }
      }
      ),
      {
        loading: "Updating comment...",
        success: (message: string) => message,
        error: (message: string) => message,
      }
    )
  };
  const handleCommentDelete = async (commentId: string) => {
    toast.promise(
      new Promise<string>(async (resolve, reject) => {
        try {
          const response = await deleteVideoComment(commentId);
          if (response.success) {
            resolve("Comment Deleted...");
            setComments(
              (prev) => prev && prev.filter((comment) => comment._id !== commentId)
            );
          }
        } catch (error) {
          reject("Something went wrong while deleting the comment");
        }
      }
      ),
      {
        loading: "Deleting comment...",
        success: (message: string) => message,
        error: (message: string) => message,
      }
    )
  };
  const addEmoji = (emoji: { native: string }) => {
    setNewComment(newComment + emoji.native);
  };
  const handleAddToPlaylist = async (playlistId: string, videoId: string) => {
    try {
      const response = await addVideoToPlaylist(playlistId, videoId);

      if (response.message === "Video added to playlist successfully") {
        toast.success("Video added to playlist successfully");
      } else if (
        response.message === "Playlist created and video added successfully"
      ) {
        dispatch(setPlaylist([...playList, response.data]));
        toast.success("Playlist created and video added successfully");
      } else if (response.message === "Video already added to playlist") {
        toast.warning("Video already in playlist");
      }
      setPlaylistMenuVisible(null);
      setMenuVisible(null);
    } catch (error) {
      console.error("Error adding video to playlist:", error);
    }
  };
  const handleRemoveFromPlaylist = async (
    playlistId: string,
    videoId: string
  ) => {
    toast.promise(
      new Promise<string>(async (resolve, reject) => {
        try {
          const response = await removeVideoFromPlaylist(playlistId, videoId);
          if (!response.success) reject(response.message);
          if (response.message === "Video removed from playlist successfully") {
            resolve(response.message);
            setMatchedPlaylist((prev) => {
              if (prev) {
                return {
                  ...prev,
                  playlistVideos: prev.playlistVideos.filter(
                    (video) => video._id !== videoId
                  ),
                };
              }
              return prev;
            });
            if (matchedPlaylist?.playlistVideos) {
              dispatch(
                setPlaylistVideos(
                  matchedPlaylist.playlistVideos
                    .filter((video: VideoProps) => video._id !== videoId)
                    .map((video: any) => ({
                      ...video,
                      isLiked: false,
                      isDisliked: false,
                      numberoflikes: 0,
                      numberofdislike: 0,
                    }))
                )
              );
            }
          }
          setMenuVisible(null);
        } catch (error) {
          reject("Something went wrong while removing the video from playlist");
        }
      }
      ),
      {
        loading: "Removing video from playlist...",
        success: (message: string) => message,
        error: (message: string) => message,
      }
    )
  };

  const [showAllComments, setShowAllComments] = useState(false);

  const toggleComments = () => {
    setShowAllComments(!showAllComments);
  };

  const commentsToShow = showAllComments ? comments : comments?.slice(0, 1);

  if (isLoading) {
    return (<VideoPageSkeleton />);
  }
  return (
    <div className={`w-full h-screen overflow-y-auto bg-gray-100 dark:bg-black dark:text-zinc-400`}>
      <div className="flex w-full flex-wrap lg:flex-nowrap" ref={videoContainerRef}>
        {/* left */}
        <div className="w-full lg:w-3/5 m-1 md:m-4">
          <div className="relative object-cover rounded-md">
            <VideoPlayer
              options={videoPlayerOptions}
              onReady={handlePlayerReady}
            />
          </div>

          <div className="mt-2">
            <h1 className="text-xl md:text-2xl font-bold">
              {videoInfo ? truncateTitle(videoInfo.title) : ""}
            </h1>

            <div className="flex items-center flex-col md:flex-row mt-2">
              <div className=" flex items-center w-full justify-between md:justify-normal md:w-3/5">
                <Link to={`/user/@${videoInfo?.videoOwner.userName}`}>
                  <img
                    src={videoInfo?.videoOwner.avatar}
                    alt="avatar"
                    className="w-14 h-14 mx-2 object-cover rounded-full"
                  />
                </Link>
                <div className="mx-2 text-sm md:text-base">
                  <h1 className="font-bold">
                    {videoInfo?.videoOwner.fullName}
                  </h1>
                  <p className="text-xs font-semibold">
                    {videoInfo
                      ? formatCount(videoInfo.videoOwner.subscriberCount ?? 0)
                      : ""}{" "}
                    subscribers
                  </p>
                </div>
                <div
                  className="relative mx-2 rounded-full"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <Button
                    className="rounded-full text-sm md:text-base"
                    onClick={authStatus ? handleSubscribeClick : null}
                  >
                    {videoInfo?.videoOwner.isSubscribed ? (
                       <div className="flex items-center p-1">
                       <IoMdNotificationsOutline className="mx-1" /> Subscribed
                     </div>
                   ) : (
                     <div className="flex items-center p-1">
                       <IoMdNotificationsOff className="mx-1" /> Subscribe
                     </div>
                    )}
                  </Button>
                  {!authStatus && isHovered && (
                    <div className="absolute top-10 w-60 p-2 bg-white dark:bg-black border rounded shadow-lg">
                      <p className="text-sm py-1">
                        Want to subscribe to this channel?
                      </p>
                      <p className="text-sm py-1">
                        Sign in to subscribe to this channel.
                      </p>
                      <p className="text-sm py-1">
                        <Link to="/login" className="text-blue-500 underline">
                          Sign in
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t md:border-none relative my-2 md:mt-0 flex items-center justify-between w-full md:w-2/5 dark:text-white">
                <div className="w-full flex md:space-x-4 text-sm md:text-base">
                  <div
                    className="flex items-center space-x-1 md:border border-black dark:border-white rounded-full px-3 py-1"
                    onMouseEnter={() => setIsLikeHovered(true)}
                    onMouseLeave={() => setIsLikeHovered(false)}
                  >
                    <button
                      className="flex items-center space-x-1 px-2 md:py-1 border-r border-black  dark:border-white"
                      onClick={
                        authStatus && videoInfo?._id
                          ? () => handleVideoLike(videoInfo._id)
                          : () => { }
                      }
                    >
                      {videoInfo?.isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
                      <span className="text-black px-1 dark:text-white">
                        {videoInfo
                          ? formatCount(videoInfo.numberoflikes ?? 0)
                          : ""}
                      </span>
                    </button>
                    <button
                      className="flex items-center space-x-1 px-2 py-1"
                      onClick={
                        authStatus && videoInfo?._id
                          ? () => handleVideoDislike(videoInfo._id)
                          : () => { }
                      }
                    >
                      {videoInfo?.isDisliked ? (
                        <FaThumbsDown />
                      ) : (
                        <FaRegThumbsDown />
                      )}
                    </button>
                    {!authStatus && isLikeHovered && (
                      <div className="absolute top-10 w-60 p-2 bg-white dark:bg-black dark:text-white border rounded shadow-lg">
                        <p className="text-sm py-1">
                          Want to like or dislike this video?
                        </p>
                        <p className="text-sm py-1">
                          Sign in to like or dislike this video.
                        </p>
                        <p className="text-sm py-1">
                          <Link to="/login" className="text-blue-500 underline">
                            Sign in
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    className="flex items-center space-x-1 md:px-3 py-1 border-black dark:border-white md:border rounded-full"
                    onClick={handleShare}
                  >
                    <FaShare />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="md:m-2 p-1 md:p-4 rounded-md bg-gray-200 dark:bg-zinc-800"
            onClick={() => setIsDetailsOpen(!isdetailsOpen)}
          >
            <summary className="font-bold list-none text-sm ">
              {videoInfo
                ? !isdetailsOpen
                  ? formatCount(videoInfo.views)
                  : addComman(videoInfo.views)
                : ""}{" "}
              views{" "}
              {videoInfo
                ? !isdetailsOpen
                  ? formatWhenPosted(videoInfo.createdAt)
                  : formatDate(videoInfo.createdAt)
                : ""}
            </summary>
            <div
              className={`cursor-pointer text-sm font-medium ${!isdetailsOpen ? "line-clamp-2" : ""
                }`}
            >
              <div className="text-xs md:text-base">{parse(`${videoInfo?.description}`)}</div>
              <div className="my-5">
                <div className="flex items-start ">
                  <Link to={`/user/@${videoInfo?.videoOwner.userName}`}>
                    <img
                      src={videoInfo?.videoOwner.avatar}
                      alt="avatar"
                      className="w-14 h-14 object-cover rounded-full"
                    />
                  </Link>
                  <div className="mx-2">
                    <h1 className="font-bold text-xl">
                      {videoInfo?.videoOwner.fullName}
                    </h1>
                    <p className="text-xs font-semibold">
                      {videoInfo
                        ? formatCount(videoInfo.videoOwner.subscriberCount ?? 0)
                        : ""}{" "}
                      Subscribers
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 ">
                  <Button className="flex items-center rounded-full gap-1">
                    <BsCollectionPlayFill />
                    Videos
                  </Button>
                  <Link to={`/user/@${videoInfo?.videoOwner.userName}`}>
                    <Button className="flex items-center rounded-full gap-1">
                      <MdOutlinePersonPin />
                      About
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="md:m-2 md:p-2 rounded-md relative">
            <div className="flex items-center justify-between">
              <h1 className="px-1 md:px-2 text-xl font-bold">
                {comments?.length} Comments
              </h1>
                        <div className="px-1 md:px-2 text-xl font-bold cursor-pointer" onClick={toggleComments}>{!showAllComments?'All comments':'Comments'}</div>
            </div>
            {authStatus && (
              <CommentForm
                user={user}
                videoInfo={videoInfo}
                newComment={newComment}
                setNewComment={setNewComment}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                handleCommentPost={handleCommentPost}
                addEmoji={addEmoji}
              />
            )}
            {comments &&
              commentsToShow?.map((comment) => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  authStatus={authStatus}
                  user={user}
                  editingCommentId={editingCommentId}
                  editingCommentText={editingCommentText}
                  setEditingCommentId={setEditingCommentId}
                  setEditingCommentText={setEditingCommentText}
                  handleCommentUpdate={handleCommentUpdate}
                  handleCommentDelete={handleCommentDelete}
                  handleVideoCommentLike={handleVideoCommentLike}
                  handleVideoCommentDislike={handleVideoCommentDislike}
                />
              ))}
          </div>
        </div>

        {/* right */}
        <div className="w-full lg:w-2/5 m-1 md:m-4">
          {playlistOwnerId && playlistOwnerId !== "null" ? (
            <div className="mb-8">
              <div className="bg-gray-200 dark:bg-zinc-800 p-2 ">
                <h1 className="text-2xl font-bold">
                  {truncateTitle(
                    (matchedPlaylist?.name ?? "").toUpperCase(),
                    4
                  )}
                </h1>
                <div className="text-sm font-semibold line-clamp-2">
                  {parse(truncateTitle(matchedPlaylist?.description ?? "", 15))}
                </div>
                <div className="text-xs font-semibold">
                  {matchedPlaylist?.playlistOwner.fullName} -{" "}
                  {currentVideoIndex}/{matchedPlaylist?.numberOfVideos}
                </div>
              </div>

              {storePlayList?.map((video: Video, index) => (
                <VideoSmallCard
                  checkUser={checkUser}
                  handleRemoveFromPlaylist={() =>
                    matchedPlaylist?._id &&
                    handleRemoveFromPlaylist(matchedPlaylist._id, video._id)
                  }
                  toggleMenuPlaylist={() => toggleMenuPlaylist(video._id)}
                  menuVisiblePlaylist={menuVisiblePlaylist}
                  key={index}
                  video={video}
                  user={user}
                  playlistOwnerId={playlistOwnerId ?? null}
                  playlistId={playlistId ?? null}
                  matchedPlaylist={matchedPlaylist}
                  playlistStatus={true}
                />
              ))}
            </div>
          ) : null}
          {storeVideos?.map((video: Video, index) => (
            <VideoSmallCard
              playList={playList}
              checkUser={checkUser}
              toggleMenu={() => toggleMenu(video._id)}
              menuVisible={menuVisible}
              key={index}
              video={video}
              user={user}
              playlistOwnerId={playlistOwnerId ?? null}
              playlistId={playlistId ?? null}
              playlistMenuVisible={playlistMenuVisible}
              togglePlaylistMenu={() => togglePlaylistMenu(video._id)}
              handleAddToPlaylist={(playlistId: string) =>
                handleAddToPlaylist(playlistId, video._id)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default VideoPage;

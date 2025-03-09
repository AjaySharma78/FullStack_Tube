import { getCurrentUser, watchHistory } from "./app/api/authApis.ts";
import { setVideos } from "./app/api/slice/videoSlice.ts";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "./components/Header/Navbar.tsx";
import { getVideos } from "./app/api/videoApi.ts";
import Menu from "./components/Menu/Menu.tsx";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Logo from "./assets/Sitelogo.png";

import {
  setCredentials,
  selectCurrentUser,
  logOut,
  selectCurrentStatus,
  systemTheme,
} from "./app/api/slice/authSlice.ts";
import { userPlaylist } from "./app/api/playListApis.ts";
import {
  setLikeHistory,
  setPlaylist,
  setWatchHistory,
} from "./app/api/slice/playlistSlice.ts";
import { getLikeVideos } from "./app/api/likeApis.ts";
import { toast } from "sonner";

function App() {
  const theme = useSelector((state: any) => state.auth.theme);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const status = useSelector(selectCurrentStatus);
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const tweet = false;

  useEffect(() => {
    const handleOnline = () => {
      toast.success("You are back online");
    };

    const handleOffline = () => {
      toast.error("You are offline. Please check your internet connection.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCurrentUser();
        const userData = response.data;
        if (!userData) {
          dispatch(logOut());
          toast.info("Login or Signup to use more features");
          return;
        }
        if (!userData.user.isEmailVerified) {
          dispatch(logOut());
          toast.error("Please verify your email to continue");
          return;
        }
        dispatch(
          setCredentials({
            user: userData.user,
            accessToken: userData.accessToken,
            refreshToken: userData.refreshToken,
          })
        );
        const playlistResponse = await userPlaylist(userData.user._id);
        dispatch(setPlaylist(playlistResponse.data));
      } catch (err: any) {
        console.log(err);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    const videodata = async () => {
      try {
        const videosResponse = await getVideos();
        dispatch(setVideos(videosResponse.data.videoInfo));
      } catch (error) {
        toast.error("Failed to fetch videos");
        setLoading(false);
      }
    };

    fetchData();
    videodata();
  }, []);

  useEffect(() => {
    const fetchWatchHistory = async () => {
      try {
        const response = await watchHistory();
        dispatch(setWatchHistory(response.data));
      } catch (error) {
        toast.error("Failed to fetch watch history");
        setLoading(false);
      }
    };

    const fetchLikedVideos = async () => {
      try {
        const response = await getLikeVideos();
        dispatch(setLikeHistory(response.data));
      } catch (error) {
        toast.error("Failed to fetch liked videos");
        setLoading(false);
      }
    };

    if (user) {
      fetchWatchHistory();
      fetchLikedVideos();
    }
  }, [user]);

  const menuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    document.querySelector("html")?.classList.remove("light", "dark", "system");
    document.querySelector("html")?.classList.add(theme);
    if (theme === "system") {
      dispatch(systemTheme());
    }
    const updateTheme = () => {
      dispatch(systemTheme());
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateTheme);

    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, [theme]);

  return !loading ? (
    tweet ? (
      <div className="min-h-screen w-full flex flex-wrap content-between dark:bg-black">
        <div className="w-full block h-screen">
          <Navbar
            menuClicked={menuClick}
            isMenuOpen={isMenuOpen}
            authStatus={status}
            user={user}
          />
          <div className="w-full h-screen ">
            <main className="w-full h-full bg-gray-100 flex justify-center items-center overflow-hidden">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    ) : (
      <div className="min-h-screen w-full flex flex-wrap content-between dark:bg-black">
        <div className="w-full block h-screen">
          <Navbar
            menuClicked={menuClick}
            isMenuOpen={isMenuOpen}
            authStatus={status}
            user={user}
          />
          <div className="flex w-full h-screen ">
            <div>
              <Menu menuClicked={menuClick} isMenuOpen={isMenuOpen} />
            </div>
            <main className="w-full bg-gray-100 dark:bg-black flex justify-center items-center overflow-hidden">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    )
  ) : (
    <div className="flex justify-center items-center h-screen flex-col dark:bg-black">
      <img src={Logo} alt="image" className="w-20 h-30 object-cover" />
      <div className="relative w-[15%] bg-gray-300 h-1 mt-2 overflow-auto">
        <div className="absolute w-10 animate-wiggle h-full bg-purple-500"></div>
      </div>
    </div>
  );
}

export default App;

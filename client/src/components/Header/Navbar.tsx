import { UserProps } from "../../interface/sliceInterface";
// import announcement from "../../assets/announcement.png";
import { Link, useNavigate } from "react-router-dom";
import { searchVideo } from "../../app/api/videoApi";
import { useDebounceCallback } from "usehooks-ts";
import siteLogo from "../../assets/Sitelogo.png";
import HashTag from "../../assets/hashtag.png";
import search from "../../assets/search.png";
import avatar from "../../assets/avatar.png";
import { useEffect, useState } from "react";
import LogoutBtn from "./Logout";
import { useDispatch, useSelector } from "react-redux";
import {
  darkTheme,
  lightTheme,
  systemTheme,
} from "../../app/api/slice/authSlice";

// import { setTweetEnabled } from "../../app/api/slice/authSlice";
// import message from "../../assets/message.png";
// import Tube from "../../assets/youtube.png"
// import { useSelector } from "react-redux";

interface MenuProps {
  menuClicked: () => void;
  isMenuOpen: boolean;
  authStatus: boolean | null;
  user: UserProps | null;
}
interface Suggestion {
  _id: string;
  title: string;
}

function Navbar({ menuClicked, authStatus, user }: MenuProps) {
  // const local = useSelector((state: any) => state.auth.tweetEnabled);
  const dispatch = useDispatch();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const debounced = useDebounceCallback(setValue, 300);
  const [isInputActive, setIsInputActive] = useState(false);
  useEffect(() => {
    const featchData = async () => {
      try {
        if (value.trim() == "") return;
        const response = await searchVideo(value);
        setSuggestions(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    featchData();
  }, [value]);

  const handleSuggestionClick = (suggestion: string) => {
    setSuggestions([]);
    navigate(`/search?query=${encodeURIComponent(suggestion)}`);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value.trim() === "") return;
    setSuggestions([]);
    navigate(`/search?query=${encodeURIComponent(value)}`);
  };

  const theme = useSelector((state: any) => state.auth.theme);

  // const toggleTweetEnabled = () => {
  //   const newTweetEnabledState = !local;
  //   dispatch(setTweetEnabled(newTweetEnabledState));
  // };
  const handleThemeToggle = () => {
    if (theme === "dark") {
      dispatch(lightTheme());
    } else if (theme === "light") {
      dispatch(systemTheme());
    } else {
      dispatch(darkTheme());
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsInputActive(false);
      setSuggestions([]);
    }, 200);
  };




  return (
    <div className="flex justify-between  items-center py-2 px-4 bg-gray-200 dark:bg-black dark:border-b dark:border-zinc-500 ">
      {/*  */}
      <div className="flex items-center gap-2 ">
        <img
          src={siteLogo}
          alt="logo"
          width={25}
          height={25}
          className={`py-2 cursor-pointer ${isInputActive ? "hidden md:block" : "block"}`}
          onClick={menuClicked}
        />
        <Link
          to="/"
          className="flex items-center justify-center lg:justify-start gap-2 "
        >
          <span className="hidden lg:block text-gray-900 font-serif font-bold dark:text-zinc-500">
            Aakirt
          </span>
        </Link>
      </div>
      {/*  */}
      <div className={` ${isInputActive ? "w-full md:w-1/3" : "w-1/3 "} relative lg:left-32`}>
        <div className={`w-full flex items-center gap-2 text-xs md:rounded-full md:ring-[1px] ring-gray-400 md:px-2 text-gray-900`}>
          <form className="w-full flex items-center md:gap-2" onSubmit={handleFormSubmit}>
            <img src={search} alt="search" className="w-5 h-5"/>
          <input
              type="text"
              placeholder="Search"
              defaultValue={value}
              onFocus={() => setIsInputActive(true)}
              onBlur={handleBlur}
              onChange={(event) => debounced(event.target.value)}
              className="w-full p-2 bg-transparent outline-none dark:text-white"
            />
          </form> 
        {suggestions && suggestions.length > 0 && value !== '' && (
            <ul className={`${isInputActive ? " " : "hidden md:block"} absolute top-11 lg:top-full bg-white dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-600 border border-gray-300 rounded-md mt-1 z-50`}>
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion._id}
                  className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 z-50"
                  onClick={() => handleSuggestionClick(suggestion.title)}
                >
                  {suggestion.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={`flex items-strat md:items-center gap-2`}>
        <div className="flex flex-col md:flex-row items-center ">
          <div
            // onClick={toggleTweetEnabled}
            className={`relative rounded-full lg:mr-1 w-5 h-5 lg:w-7 lg:h-7 cursor-pointer group ${isInputActive ? "hidden md:block" : "block"}`}
          >
            <img src={HashTag} alt="message" width={30} height={30} />
            <div className="absolute animate-bounce top-10 z-50 hidden group-hover:block w-48 p-1 rounded-md bg-gray-200 shadow-black shadow-md">
              Coming Soon Tweet...
            </div>
          </div>
          <div className={`dark:text-zinc-300 ${isInputActive ? "hidden md:block" : "block"}` }>
            <button
              onClick={handleThemeToggle}
              className={`md:px-3 md:py-2 text-sm rounded-full flex items-center gap-1 dark:bg-black ${
                theme === "light" ? "bg-transparent md:bg-gray-300 " : theme === "dark" ? "bg-transparent md:bg-white md:dark:bg-zinc-700" : "bg-transparent md:bg-gray-300 md:dark:bg-purple-800"
              }`}
            >
               <span>{theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "🖥️"}</span><span className="hidden md:block">{theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"}</span>
            </button>
          </div>
        </div>
        {authStatus && (
          <div className="bg-white hidden md:block dark:bg-zinc-700 outline-none rounded-full cursor-pointer">
            {user ? <LogoutBtn /> : ""}
          </div>
        )}
        <div className={`${isInputActive ? "hidden md:block" : "block"}`}>
          <div className="flex flex-col ">
            <span className="text-[8px] md:text-xs text-gray-900 dark:text-zinc-300 leading-3 font-medium mb-0.5 md:mb-1 line-clamp-1 ">
              {user?.fullName || "Guest"}
            </span>
            <span className="text-[8px] md:text-[10px] text-gray-900 dark:text-zinc-400 text-right">
              {user?.userName && `@${user.userName}`}
            </span>
          </div>
        </div>
        <Link to={`${user ? `/user/@${user?.userName}` : "/login"}`} className={`w-10 h-10 ${isInputActive ? "hidden md:block" : "block"}`}>
          <img
            src={user?.avatar || avatar}
            alt="avatar"
            className="rounded-full object-cover w-full h-full"
          />
        </Link>
      </div>
    </div>
  );
}

export default Navbar;

import React from "react";
import { Link, useLocation } from "react-router-dom";
import upload from "../../assets/upload.png";
import home from "../../assets/home.png";
import watchHistory from "../../assets/watchHistory.png";
import parent from "../../assets/parent.png";
import likeHistory from "../../assets/likeHistory.png";
// import classes from "../../assets/class.png";
// import lesson from "../../assets/lesson.png";
// import exam from "../../assets/exam.png";
// import assignment from "../../assets/assignment.png";
// import result from "../../assets/result.png";
// import attendance from "../../assets/attendance.png";
// import calendar from "../../assets/calendar.png";
// import message from "../../assets/message.png";
// import announcement from "../../assets/announcement.png";
import profile from "../../assets/profile.png";
import setting from "../../assets/setting.png";
import editProfile from "../../assets/editaccount.png";
import logout from "../../assets/logout.png";
import login from "../../assets/login.png";
import siteLogo from "../../assets/Sitelogo.png";
import signup from "../../assets/signup.png";
import subscription from "../../assets/subscription.png";
import { useSelector } from "react-redux";
import { selectCurrentStatus } from "../../app/api/slice/authSlice";
import { logout as Logout } from "../../app/api/authApis";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logOut } from "../../app/api/slice/authSlice";
import { toast } from "sonner";

interface MenuProps {
  menuClicked: () => void;
  isMenuOpen: boolean;
}

const Menu: React.FC<MenuProps> = ({ menuClicked, isMenuOpen }) => {
  const authStatus = useSelector(selectCurrentStatus);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await Logout();
      toast.success("Logged Out Successfully");
      dispatch(logOut());
      if (!location.pathname.startsWith("/videos/")) {
        navigate("/");
      }
      menuClicked();
    } catch (error) {
      console.log(error);
    }
  };

  const menuItems = [
    {
      title: "MENU",
      items: [
        {
          icon: profile,
          label: "You",
          href: "/user-profile",
          active: authStatus,
        },
        {
          icon: home,
          label: "Home",
          href: "/",
          active: true,
        },
        {
          icon: likeHistory,
          label: "Like History",
          href: "/like-history",
          active: authStatus,
        },
        {
          icon: watchHistory,
          label: "Watch History",
          href: "/watch-history",
          active: authStatus,
        },
        {
          icon: subscription,
          label: "Subscriptions",
          href: "/user-subscription",
          active: authStatus,
        },
        {
          icon: upload,
          label: "Upload Video",
          href: "/upload-video",
          active: authStatus,
        },
        // {
        //   icon: classes,
        //   label: "Classes",
        //   href: "/list/classes",
        //   active: !authStatus,
        // },
        // {
        //   icon: lesson,
        //   label: "Lessons",
        //   href: "/list/lessons",
        //   active: !authStatus,
        // },
        // {
        //   icon: exam,
        //   label: "Exams",
        //   href: "/list/exams",
        //   active: !authStatus,
        // },
        // {
        //   icon: assignment,
        //   label: "Assignments",
        //   href: "/list/assignments",
        //   active: !authStatus,
        // },
        // {
        //   icon: result,
        //   label: "Results",
        //   href: "/list/results",
        //   active: !authStatus,
        // },
        // {
        //   icon: attendance,
        //   label: "Attendance",
        //   href: "/list/attendance",
        //   active: !authStatus,
        // },
        // {
        //   icon: calendar,
        //   label: "Events",
        //   href: "/list/events",
        //   active: !authStatus,
        // },
        // {
        //   icon: message,
        //   label: "Messages",
        //   href: "/list/messages",
        //   active: !authStatus,
        // },
        // {
        //   icon: announcement,
        //   label: "Announcements",
        //   href: "/list/announcements",
        //   active: !authStatus,
        // },
      ],
    },
    {
      title: "OTHER",
      items: [
        {
          icon: editProfile,
          label: "Edit Profile",
          href: "/edit-profile",
          active: authStatus,
        },
        {
          icon: parent,
          label: "Security",
          href: "/security",
          active: authStatus,
        },
        {
          icon: setting,
          label: "Settings",
          href: "/settings",
          active: true,
        },
        {
          icon: login,
          label: "Login",
          href: "/login",
          active: !authStatus,
        },
        {
          icon: signup,
          label: "Signup",
          href: "/signup",
          active: !authStatus,
        },
        {
          icon: logout,
          label: "Logout",
          href: "/logout",
          active: authStatus,
        },
      ],
    },
  ];
  const menu = [
    {
      icon: home,
      label: "Home",
      href: "/",
      active: true,
    },
    {
      icon: watchHistory,
      label: "Watch History",
      href: "/watch-history",
      active: authStatus,
    },
    {
      icon: likeHistory,
      label: "Like History",
      href: "/like-history",
      active: authStatus,
    },
    {
      icon: profile,
      label: "You",
      href: "/user-profile",
      active: authStatus,
    },
    {
      icon: subscription,
      label: "subscription",
      href: "/user-subscription",
      active: authStatus,
    },
    {
      icon: login,
      label: "Login",
      href: "/login",
      active: !authStatus,
    },
    {
      icon: signup,
      label: "Signup",
      href: "/signup",
      active: !authStatus,
    },
  ];
  return (
    <>
      <div>
        <div className="bg-gray-200 hidden md:block dark:bg-black dark:border-r dark:border-zinc-500 relative h-screen">
          <div className="flex flex-col gap-1 px-2 py-3">
            {menu.map(
              (item, index) =>
                item.active && (
                  <div key={index} className="px-3 py-0.5">
                    <Link
                      to={item.href}
                      key={item.label}
                      className="flex items-center justify-start gap-2 text-gray-900 py-2 group"
                      onClick={
                        item.label.toLowerCase() === "logout"
                          ? handleLogout
                          : undefined
                      }
                    >
                      <img
                        src={item.icon}
                        alt={item.label}
                        width={22}
                        height={22}
                      />
                      <span className=" bg-gray-200 p-2 z-50 absolute hidden group-hover:inline-block text-sm ml-5 mt-10 text-gray-900 rounded shadow-lg">
                        {item.label}
                      </span>
                    </Link>
                  </div>
                )
            )}
          </div>
        </div>

        <div
          className={`absolute top-0 flex w-full transition-all duration-100 ease-in-out ${
            isMenuOpen ? "z-10" : "-z-10"
          } `}
        >
          <div
            className={`relative lg:w-1/6 bg-gray-200 dark:bg-black pl-2 py-2 transition-all duration-100 ease-in-out ${
              isMenuOpen ? "left-0 " : "left-[-200px]"
            }`}
          >
            <div className="flex items-center gap-2 pl-2">
              <img
                src={siteLogo}
                alt="logo"
                width={25}
                height={25}
                className="py-2 cursor-pointer"
                onClick={menuClicked}
              />
              <Link
                to="#"
                className="flex items-center justify-center lg:justify-start gap-2 "
              >
                <span className=" text-gray-900 dark:text-zinc-500 font-serif font-bold">
                  Aakirt
                </span>
              </Link>
            </div>

            <div className="w-full h-screen overflow-y-auto  ">
              <div>
                {menuItems.map((menu, index) => (
                  <div key={index} className="flex flex-col gap-1 py-4">
                    {menu.items.map(
                      (item, index) =>
                        item.active && (
                          <div
                            key={index}
                            onClick={
                              item.label.toLowerCase() === "logout"
                                ? handleLogout
                                : menuClicked
                            }
                            className="px-3 py-0.5"
                          >
                            <Link
                              to={item.href === "/logout" ? "#" : item.href}
                              key={item.label}
                              className="flex items-center justify-start gap-2 text-gray-900 dark:text-zinc-500 py-2"
                            >
                              <img
                                src={item.icon}
                                alt={item.label}
                                width={22}
                                height={22}
                              />
                              <span className="w-32 lg:w-full">
                                {item.label}
                              </span>
                            </Link>
                          </div>
                        )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            onClick={menuClicked}
            className={`cursor-pointer w-full h-[calc(100vh+62px)]  bg-white transition-all duration-100 ease-in-out  ${
              isMenuOpen ? "opacity-50 dark:opacity-15" : "opacity-0"
            } lg:w-5/6`}
          ></div>
        </div>
      </div>
    </>
  );
};

export default Menu;

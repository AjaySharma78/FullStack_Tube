import Login from "../pages/Login.tsx";
import Signup from "../pages/Signup.tsx";
import WatchHistory from "../pages/WatchHistory.tsx";
import Verify from "../pages/Verify.tsx";
import Home from "../pages/Home.tsx";
import AuthLayout from "../components/AuthLayout.tsx";
import ResetPassword from "../pages/ResetPassword.tsx";
import UserProfile from "../pages/UserProfile.tsx";
import App from "../App.tsx";
import VideoPage from "../pages/VideoPage.tsx";
import VideoSection from "../pages/VideoSection.tsx";
import PlayList from "../pages/PlayList.tsx";
import { createBrowserRouter } from "react-router-dom";
import ForgotPassword from "../pages/ForgotPassword.tsx";
import PublishedVideoSection from "../pages/PublishedVideoSection.tsx";
import PostVideo from "../pages/PostVideo.tsx";
import Profile from "../pages/Profile.tsx";
import Error from "../pages/Error.tsx";
import Security from "../pages/Security.tsx";
import LikeHistory from "../pages/LikeHistory.tsx";
import YouPage from "../pages/YouPage.tsx";
import Subscription from "../pages/Subscription.tsx";
import SubscriptionManage from "../pages/SubscriptionManage.tsx";
import SearchVideos from "../pages/SearchVideos.tsx";
import Setting from "../pages/Setting.tsx";
import TwoFactorAuth from "../pages/TwoFactorAuth.tsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/verify-email",
        element: <Verify />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "/user-profile",
        element: (
          <AuthLayout authentication>
            {" "}
            <YouPage />
          </AuthLayout>
        ),
      },
      {
        path: "/edit-profile",
        element: (
          <AuthLayout authentication>
            {" "}
            <Profile />
          </AuthLayout>
        ),
      },
      {
        path: "/security",
        element: (
          <AuthLayout authentication>
            {" "}
            <Security />
          </AuthLayout>
        ),
      },
      {
        path: "/upload-video",
        element: (
          <AuthLayout authentication>
            {" "}
            <PostVideo />
          </AuthLayout>
        ),
      },
      {
        path: "/watch-history",
        element: (
          <AuthLayout authentication>
            {" "}
            <WatchHistory />
          </AuthLayout>
        ),
      },
      {
        path: "/like-history",
        element: (
          <AuthLayout authentication>
            {" "}
            <LikeHistory />
          </AuthLayout>
        ),
      },
      {
        path: "/user-subscription",
        element: (
          <AuthLayout authentication>
            {" "}
            <Subscription />
          </AuthLayout>
        ),
      },
      {
        path: "/user-subscription/channel",
        element: (
          <AuthLayout authentication>
            {" "}
            <SubscriptionManage />
          </AuthLayout>
        ),
      },
      {
        path: "/videos/:videoId/:userId/:playlistOwnerId/:playlistId?",
        element: <VideoPage />,
      },

      {
        path: "/user/:userName",
        element: <UserProfile />,
        children: [
          {
            index: true,
            element: <VideoSection />,
          },
          {
            path: "playlist/:userId",
            element: <PlayList />,
          },
          {
            path: "videos",
            element: <VideoSection />,
          },
          {
            path: "all-videos",
            element: (
              <AuthLayout authentication>
                {" "}
                <PublishedVideoSection />
              </AuthLayout>
            ),
          },
        ],
      },
      {
        path: "/search",
        element: <SearchVideos />,
      },
      {
        path: "/2fa",
        element: <TwoFactorAuth />,
      },
      {
        path: "/settings",
        element: <Setting />,
      },
      {
        path: "*",
        element: <Error />,
      },
    ],
  },
]);

export default router;

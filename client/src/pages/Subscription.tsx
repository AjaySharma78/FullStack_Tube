import {
  SubscriptionProps,
  VideoProps,
  SubscribedChannelInfo,
} from "../interface/SubscriptionInterface";
import SubscriptionVideoCard from "../components/Video/SubscriptionVideoCard";
import SubscriptionSkeleton from "../components/Skeleton/SubscriptionSkeleton";
import { getSubscriptions } from "../app/api/subscribeApi";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

interface FlattenedVideoProps extends VideoProps {
  channelInfo: SubscribedChannelInfo;
}

const Subscription = () => {
  const [flattenedVideos, setFlattenedVideos] = useState<FlattenedVideoProps[]>(
    []
  );
  const [subscriptions, setSubscriptions] = useState<SubscriptionProps[]>([]);
  const user = useSelector((state: any) => state.auth.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSubscriptions();
        const videos = response.data.flatMap((sub: SubscriptionProps) =>
          sub.subscribdedChannelsVideos.map((video: VideoProps) => ({
            ...video,
            channelInfo: sub.subscribedChannelInfo,
          }))
        );
        setFlattenedVideos(shuffleArray(videos));
        setSubscriptions(response.data);
      } catch (err: any) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  if (loading) {
    return <SubscriptionSkeleton />;
  }
  return (
    <div className="w-full h-full overflow-y-auto p-1 md:p-5 realtive">
      <Link
        to={`/user-subscription/channel`}
        className="absolute right-1 md:right-10 mt-5 hover:text-blue-500 font-bold dark:text-white dark:hover:text-purple-500 dark:bg-zinc-800 p-1 rounded-md"
      >
        Manage
      </Link>
      {subscriptions.length === 0 ? (
        <p className="text-gray-500">Not subscribed to any channels yet.</p>
      ) : (
        subscriptions.map((sub) => (
          <div key={sub._id} className="mb-5">
            {sub.subscribdedChannelsVideos.length === 0 ? (
              <div className="w-full rounded-md  bg-gray-300 p-2 dark:bg-zinc-800 dark:text-zinc-400">
                <Link
                  to={`/user/@${sub.subscribedChannelInfo.userName}`}
                  className="flex w-full items-center gap-2"
                >
                  <img
                    src={sub.subscribedChannelInfo.avatar}
                    alt="image/jpg"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <h1 className="font-bold text-xl md:text-2xl">
                    {sub.subscribedChannelInfo.fullName}
                  </h1>
                </Link>
                {sub.subscribdedChannelsVideos.length === 0 && (
                  <p className="text-gray-500 py-2">
                    User has not posted any video yet.
                  </p>
                )}
              </div>
            ) : (
              <div>
                {flattenedVideos.map((video) => (
                  <SubscriptionVideoCard
                    video={video}
                    sub={sub}
                    user={user}
                    key={video._id}
                  />
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Subscription;

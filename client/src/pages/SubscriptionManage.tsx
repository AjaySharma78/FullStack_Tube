import SubscriptionManageSkeleton from "../components/Skeleton/SubscriptionManageSkeleton";
import { getSubscribeedChannels, toggleSubscribe } from "../app/api/subscribeApi";
import { IoMdNotificationsOff, IoMdNotificationsOutline } from "react-icons/io";
import { SubscribedChannel } from "../interface/SubscriptionInterface";
import { formatCount } from "../utils/format";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import { toast } from "sonner";

const SubscriptionManage = () => {
  const [subscribedChannels, setSubscribedChannels] = useState<
    SubscribedChannel[]
  >([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const featchData = async () => {
      try {
        const response = await getSubscribeedChannels();
        setSubscribedChannels(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    featchData();
  }, []);

  const handleSubscribeClick = async (id: string) => {
    toast.promise(
      new Promise<string>(async (resolve, reject) => {
        try {
          const response = await toggleSubscribe(`${id}`);
          if (!response.data) return;
          resolve(response.message);
          setSubscribedChannels((prev) => {
            return prev.map((sub) => {
              if (sub.subscribedChannelInfo._id === id) {
                return {
                  ...sub,
                  subscribedChannelInfo: {
                    ...sub.subscribedChannelInfo,
                    isSubscribed: !sub.subscribedChannelInfo.isSubscribed,
                  },
                };
              }
              return sub;
            });
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

  if (loading) {
    return <SubscriptionManageSkeleton />;
  }

  return (
    <div className="w-full h-full overflow-y-auto p-1 md:p-5 realtive">
      {subscribedChannels.length === 0 ? (
        <div className="text-center text-gray-500">
          No subscribed channels yet.
        </div>
      ) : (
        subscribedChannels.map((sub) => (
          <div
            key={sub._id}
            className="w-full flex justify-start gap-5 md:justify-between items-center mb-3 p-3 bg-gray-300 dark:bg-zinc-800 dark:text-zinc-400 rounded-md"
          >
            <div className=" flex justify-center items-center">
              <img
                src={sub.subscribedChannelInfo.avatar}
                alt="avatar"
                className="w-12 h-12 md:w-32 md:h-32 rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col w-[50%] lg:w-[60%]">
              <h1 className="font-bold text-sm md:text-2xl text-start">
                {sub.subscribedChannelInfo.fullName}
              </h1>
              <p className="text-gray-500 text-[10px] md:text-base">
                @{sub.subscribedChannelInfo.userName} |{" "}
                {formatCount(sub.subscribedChannelInfo.subscribersCount)}
              </p>
              <p className="text-gray-500 line-clamp-2 text-[10px] md:text-base">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Adipisci repellendus totam dicta accusamus sit? Omnis aut
                voluptas quasi odio debitis voluptates corrupti repudiandae,
                dolor sed tempore in reiciendis rerum illum eligendi
                necessitatibus ipsum illo eius tempora aperiam? Qui dolore quia
                praesentium consequuntur, iste aspernatur natus asperiores vel
                totam ab! Repudiandae aliquam unde soluta impedit similique
                quaerat voluptatem non blanditiis, natus quia praesentium.
                Labore obcaecati ipsa hic, culpa porro ea impedit, temporibus
                aut explicabo deserunt voluptas perferendis aspernatur nostrum
                nobis, dignissimos reprehenderit quae! Quo repellendus
                explicabo, minus quam enim perferendis quas doloremque ipsam
                dicta, magni ullam repudiandae ratione perspiciatis temporibus
                recusandae!{" "}
              </p>
            </div>
            <div className="flex justify-center items-center">
              <Button
                className="rounded-full text-[10px] md:text-base"
                onClick={() =>
                  handleSubscribeClick(sub.subscribedChannelInfo._id)
                }
              >
                {sub.subscribedChannelInfo.isSubscribed ? (
                  <div className="flex items-center">
                    <IoMdNotificationsOutline className="mx-1" /> Subscribed
                  </div>
                ) : (
                  <div className="flex items-center">
                    <IoMdNotificationsOff className="mx-1" /> Subscribe
                  </div>
                )}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SubscriptionManage;

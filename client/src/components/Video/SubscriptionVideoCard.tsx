import { Link } from "react-router-dom";
import { encryptData, formatDate } from "../../utils/format";
import parse from "html-react-parser";
import { UserProps } from "../../interface/sliceInterface";
import {
  SubscribedChannelInfo,
  SubscriptionProps,
  VideoProps,
} from "../../interface/SubscriptionInterface";

interface FlattenedVideoProps extends VideoProps {
  channelInfo: SubscribedChannelInfo;
}

interface SubscriptionVideoCardProps {
  video: FlattenedVideoProps;
  sub: SubscriptionProps;
  user: UserProps;
}

const SubscriptionVideoCard: React.FC<SubscriptionVideoCardProps> = ({
  video,
  sub,
  user,
}) => {

  const encryptedVideoId = encryptData(video._id);
  const encryptedUserId = encryptData(user ? user._id : null);
  const encryptedPlaylistOwnerId = encryptData(null);
  return (
    <div key={video._id} className="w-full rounded-md my-4 p-2 bg-gray-300 dark:text-zinc-400 dark:bg-zinc-800">
      <Link
        to={`/user/@${sub.subscribedChannelInfo.userName}`}
        className="flex w-full items-center gap-2 mb-4"
      >
        <img
          src={video.channelInfo.avatar}
          alt="image/jpg"
          className="w-10 h-10 rounded-full object-cover"
        />
        <h1 className="font-bold text-xl md:text-2xl">{video.channelInfo.fullName}</h1>
      </Link>
      <Link
        to={`/videos/${encryptedVideoId}/${encryptedUserId}/${encryptedPlaylistOwnerId}`}
        className="flex flex-wrap md:flex-nowrap gap-5 py-2 group"
      >
        <div className="w-full md:w-64 h-32">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover rounded-md group-hover:hidden"
          />
          <video
            src={video.videoFile}
            onMouseEnter={(e) => {
              e.currentTarget.play();
            }}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
            }}
            className="w-full h-full cursor-pointer hidden group-hover:block object-cover"
          ></video>
        </div>
        <div className="w-full md:w-3/5 h-full flex flex-col gap-2">
          <h1 className="text-lg font-semibold line-clamp-1">{video.title}</h1>
          <div className="text-xs text-gray-500">
            {video.channelInfo.fullName} | {video.views} views |{" "}
            {formatDate(video.createdAt)}
          </div>
          <h3 className="text-sm text-gray-500 line-clamp-2">
            {parse(video.description)}
          </h3>
        </div>
      </Link>
    </div>
  );
};

export default SubscriptionVideoCard;

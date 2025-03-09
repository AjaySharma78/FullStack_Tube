export interface VideoProps {
    _id: string;
    title: string;
    description: string;
    duration: number;
    thumbnail: string;
    videoFile: string;
    views: number;
    createdAt: string;
  }
  
  export interface SubscribedChannelInfo {
    _id: string;
    fullName: string;
    userName: string;
    avatar: string;
  }
  
  export interface SubscriptionProps {
    _id: string;
    subscribedChannelInfo: SubscribedChannelInfo;
    subscribdedChannelsVideos: VideoProps[];
  }

  export interface SubscribedChannelInfo {
    avatar: string;
    fullName: string;
    isSubscribed: boolean;
    subscribersCount: number;
    userName: string;
  }
  
  export interface SubscribedChannel {
    _id: string;
    subscribedChannelInfo: SubscribedChannelInfo;
  }
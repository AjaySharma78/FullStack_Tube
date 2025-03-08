interface VideoOwner {
  _id: string;
  isSubscribed: boolean;
  subscriberCount: number;
  fullName: string;
  avatar: string;
  userName: string;
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  videoFile: string;
  thumbnail: string;
  videoFileMpeg: string;
  duration: number;
  views: number;
  isPublished: boolean;
  videoOwner: VideoOwner;
  createdAt: string;
  isLiked: boolean;
  isDisliked: boolean;
  numberoflikes: number;
  numberofdislike: number;
}
export interface UserProfileProps {
    avatar: string;
    channelCount: number;
    coverImage: string;
    createdAt: string;
    fullName: string;
    isSubscribed: boolean;
    subscriberCount: number;
    userName: string;
    videoCount: number;
    videos: Array<Video>; 
    _id: string;
  }
  
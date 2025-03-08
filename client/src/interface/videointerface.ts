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
    videoFileMpeg: string;
    thumbnail: string;
    duration: number;
    views: number;
    isPublished: boolean;
    videoOwner: VideoOwner;
    createdAt: string;
    isLiked: boolean;
    isDisliked: boolean;
    numberoflikes: number | null;
    numberofdislike: number | null;
  }
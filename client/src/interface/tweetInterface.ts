export interface TweetOwner {
    avatar: string;
    fullName: string;
    userName: string;
    _id: string;
  }

  
  export interface TweetVideo {
    video: string;
    duration: number;
    _id: string;
  }
  
  export interface Tweet {
    _id: string;
    content: string;
    images: [];
    videos: TweetVideo[];
    createdAt: string;
    likesCount: number;
    dislikesCount: number;
    tweetOwner: TweetOwner;
  }
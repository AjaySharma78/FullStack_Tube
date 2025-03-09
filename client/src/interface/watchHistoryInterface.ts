export interface WatchVideo {
    duration: number;
    isPublished: boolean;
    thumbnail: string;
    title: string;
    videoFile: string;
    videoFileMpeg: string;
    description: string;
    createdAt: string;
    videoOwner: {
      _id: string;
      avatar: string;
      fullName: string;
      userName: string;
    };
    _id: string;
    views: number;
  }
  
  
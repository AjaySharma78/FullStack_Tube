export interface VideoProps {
    _id: string;
  videoFile: string;
  thumbnail: string;
  videoFileMpeg: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  duration: number;
  isPublished: boolean;
  videoOwner: string;
  views: number;
  }
  
  export interface PlayListProps {
    _id: string;
    createdAt: string;
    description: string;
    name: string;
    numberOfVideos: number;
    playlistOwner: {
      _id: string;
      userName: string;
      fullName: string;
    };
    updatedAt: string;
    playlistVideos: VideoProps[];
  }
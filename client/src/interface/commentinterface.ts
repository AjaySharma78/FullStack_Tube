export interface CommentOwner {
    _id:string;
    avatar: string;
    fullName: string;
    userName: string;
  }
  
  export interface Comment {
    _id: string;
    content: string;
    createdAt: string;
    likesCount: number;
    dislikesCount: number;
    isLiked: boolean;
    isDisliked: boolean;
    commentOwner: CommentOwner;
  }
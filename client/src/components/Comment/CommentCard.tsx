import {
  FaRegThumbsUp,
  FaRegThumbsDown,
  FaThumbsUp,
  FaThumbsDown,
} from "react-icons/fa";
import { formatWhenPosted } from "../../utils/format";
import { Button } from "../Index.ts";
import { MdDelete } from "react-icons/md";
import { GrDocumentUpdate } from "react-icons/gr";
import { Link } from "react-router-dom";
interface CommentProps {
  comment: any;
  authStatus: boolean | null;
  user: any;
  editingCommentId: string | null;
  editingCommentText: string;
  setEditingCommentId: (id: string | null) => void;
  setEditingCommentText: (text: string) => void;
  handleCommentUpdate: (id: string) => void;
  handleCommentDelete: (id: string) => void;
  handleVideoCommentLike: (id: string) => void;
  handleVideoCommentDislike: (id: string) => void;
}

const CommentCard: React.FC<CommentProps> = ({
  comment,
  authStatus,
  user,
  editingCommentId,
  editingCommentText,
  setEditingCommentId,
  setEditingCommentText,
  handleCommentUpdate,
  handleCommentDelete,
  handleVideoCommentLike,
  handleVideoCommentDislike,
}) => {
  return (
    <div key={comment._id} className=" flex items-start gap-2 p-2">
      <Link
        to={`/user/@${comment.commentOwner.userName}`}
        className="flex items-center justify-center"
      >
        <img
          src={comment.commentOwner.avatar}
          alt="avatar"
          className="w-14 h-12 md:h-14 object-cover rounded-full"
        />
      </Link>
      <div className="w-[90%]">
        <h1 className="font-semibold text-xs md:text-sm">
          @{comment.commentOwner.userName}
          <span className="text-[10px] font-normal pl-2 text-gray-600">
            {formatWhenPosted(comment.createdAt)}
          </span>
        </h1>
        {editingCommentId === comment._id ? (
          <div>
            <textarea
              value={editingCommentText}
              onChange={(e) => setEditingCommentText(e.target.value)}
              className="text-xs md:text-base w-full md:p-2 outline-none bg-transparent border-black dark:border-zinc-400 border-b-2"
            />
            <Button
              onClick={() => handleCommentUpdate(comment._id)}
              className="p-2 text-white rounded-md"
            >
              Update
            </Button>
            <Button
              onClick={() => setEditingCommentId(null)}
              className="ml-2 p-2 text-white rounded-md"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <p className="text-xs md:text-[13px] font-semibold">{comment.content}</p>
        )}
        <div className="flex justify-between items-center">
          <div className="relative flex items-center gap-2 text-xs md:text-lg my-2">
            <button
              className="flex items-center "
              disabled={authStatus ? false : true}
              onClick={
                authStatus
                  ? () => handleVideoCommentLike(comment._id)
                  : () => {}
              }
            >
              {comment.isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
              <span className="px-1 text-sm">{comment.likesCount}</span>
            </button>
            <button
              className="flex items-center"
              disabled={authStatus ? false : true}
              onClick={
                authStatus
                  ? () => handleVideoCommentDislike(comment._id)
                  : () => {}
              }
            >
              {comment.isDisliked ? <FaThumbsDown /> : <FaRegThumbsDown />}
            </button>
          </div>
          {authStatus && user._id === comment.commentOwner._id ? (
            <div className="relative flex items-center gap-2 text-xs md:text-lg my-2">
              <button
                className={`flex items-center`}
                disabled={authStatus ? false : true}
                onClick={() => {
                  setEditingCommentId(comment._id);
                  setEditingCommentText(comment.content);
                }}
              >
                <GrDocumentUpdate className="w-4 h-4" />
              </button>
              <button
                className={`flex items-center`}
                onClick={() => handleCommentDelete(comment._id)}
              >
                <MdDelete className="w-5 h-5"/>
              </button>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;

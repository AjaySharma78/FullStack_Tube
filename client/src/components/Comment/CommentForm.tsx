import { BsEmojiSmile } from "react-icons/bs";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { UserProps } from "../../interface/sliceInterface";
import { Video } from "../../interface/videointerface";
import { Button } from "../Index";
import { useEffect, useState } from "react";
import Send from "../../assets/send.png"
interface CommentFormProps {
  user: UserProps | null;
  videoInfo: Video | null;
  newComment: string;
  setNewComment: (comment: string) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  handleCommentPost: (videoId: string) => void;
  addEmoji: (emoji: { native: string }) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({
  user,
  videoInfo,
  newComment,
  setNewComment,
  showEmojiPicker,
  setShowEmojiPicker,
  handleCommentPost,
  addEmoji,
}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (videoInfo?._id) handleCommentPost(videoInfo._id);
        }}
        className="flex items-center gap-2 p-2 dark:bg-zinc-800 dark:text-zinc-400 rounded-md"
      >
        <div className="flex items-center justify-center">
          <img
            src={user?.avatar}
            alt="avatar"
            className="w-14 h-14 object-cover rounded-full"
          />
        </div>
        <div className="w-[80%] flex items-center gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a public comment..."
            className="text-sm md:text-base w-full p-2 outline-none bg-transparent border-black dark:border-zinc-400 border-b-2"
          />
          <button
            type="button"
            className="hidden md:block"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <BsEmojiSmile />
          </button>
          <Button
            type="submit"
            className="p-2 text-white rounded-md"
            bgColor={`${
              !newComment.trim() ? "md:bg-purple-400" : "md:bg-purple-500"
            }`}
            disabled={!newComment.trim()}
          >
          {isSmallScreen ? <img src={Send} alt="img" className="w-6" /> : "Comment"}
          </Button>
        </div>
      </form>
      {showEmojiPicker && (
        <div className="z-10 absolute rounded-lg ">
          <Picker
            data={data}
            onEmojiSelect={addEmoji}
            previewPosition="none"
            perLine={isSmallScreen ? 7 : 10}
            emojiButtonSize={40}
            custom={[]}
          />
        </div>
      )}
    </div>
  );
};

export default CommentForm;

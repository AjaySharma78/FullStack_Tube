
import Carousel from "../components/Carousel";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import list from "../assets/carousel.png";
import grid from "../assets/grid.png";
import LikeAndWatchHistorySkeleton from "../components/Skeleton/LikeAndWatchHistorySkeleton";

const LikeHistory = () => {
  const userLikeHistory = useSelector((state: any) => state.playlist.LikeHistory);
  const [gridView, setGridView] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLikeHistory) {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [userLikeHistory]);

  const handleGridView = () => {
    setGridView(!gridView);
  };

  return (
    <div className="w-full h-screen p-1 md:p-5 overflow-y-auto">
      <div className="flex justify-between items-center">
      <h1 className="text-2xl md:text-6xl font-bold py-4 dark:text-zinc-400">Like History</h1> 
      <button className="md:mr-10" onClick={handleGridView}>
          <img
            src={gridView ? list : grid}
             className="dark:bg-zinc-800 rounded-md w-7 md:w-10 h-7 md:h-10 p-1"
            alt="image/png"
          />
        </button>
      </div>
      {loading ? (
       <LikeAndWatchHistorySkeleton />
      ) : userLikeHistory && userLikeHistory.length > 0 ? (
        <Carousel slides={userLikeHistory} gridView={gridView} />
      ) : (
        <div className="text-center mt-10 dark:text-white">
          <h2 className="text-2xl font-semibold">No Like History</h2>
          <p className="text-gray-600">You have not Liked any videos yet.</p>
        </div>
      )}
    </div>
  );
};

export default LikeHistory;

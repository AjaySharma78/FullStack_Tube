import Carousel from "../components/Carousel";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import list from "../assets/carousel.png";
import grid from "../assets/grid.png";
import LikeAndWatchHistorySkeleton from "../components/Skeleton/LikeAndWatchHistorySkeleton";

const WatchHistory = () => {
  const userWatchHistory = useSelector((state: any) => state.playlist.WatchHistory);
  const [gridView, setGridView] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [userWatchHistory]);

  const handleGridView = () => {
    setGridView(!gridView);
  };

  return (
    <div className="w-full h-screen p-1 md:p-5 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-6xl font-bold py-4 dark:text-zinc-400">Watch History</h1> 
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
      ) : userWatchHistory && userWatchHistory.length > 0 ? (
        <Carousel slides={userWatchHistory} gridView={gridView} />
      ) : (
        <div className="text-center mt-10 dark:text-white">
          <h2 className="text-2xl font-semibold">No Watch History</h2>
          <p className="text-gray-600">You have not watched any videos yet.</p>
        </div>
      )}
    </div>
  );
};

export default WatchHistory;

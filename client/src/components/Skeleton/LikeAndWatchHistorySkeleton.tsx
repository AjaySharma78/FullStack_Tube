import Skeleton from "./Skeleton"

const LikeAndWatchHistorySkeleton = () => {
  return (
    <div className="flex gap-4  w-full">
          {[...Array(4)].map((_, index) => (
             <div
             key={index}
             className={`bg-gray-200 dark:bg-zinc-500 animate-pulse rounded-lg shadow-md flex flex-col w-full ${
               index > 1 ? 'hidden md:block' : 'block'
             }`}
           >
                  <Skeleton className="w-full h-24 lg:h-44 rounded-md" />
                  <div className="flex justify-between items-center p-2 h-20">
                    <Skeleton className="w-[60px] h-[50px] rounded-full" />
                    <div className="flex flex-col items-start w-4/5 h-full px-2">
                      <Skeleton className="w-3/4 h-4 mb-2" />
                      <Skeleton className="w-full h-4 mb-2" />
                      <Skeleton className="w-1/2 h-4" />
                    </div>
                  </div>
                </div>
          ))}
        </div>
  )
}

export default LikeAndWatchHistorySkeleton

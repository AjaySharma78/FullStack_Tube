import Skeleton from "./Skeleton"

const HomeSkeleton = () => {
  return (
    <div className="grid animate-pulse grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 p-4 w-full">
    {[...Array(9)].map((_, index) => (
      <div key={index} className="bg-gray-200 dark:bg-zinc-500 rounded-lg shadow-md flex flex-col w-full">
        <Skeleton className="w-full h-52 rounded-md" />
        <div className="flex justify-between items-center p-2 h-20">
          <Skeleton className="w-[60px] h-[60px] rounded-full" />
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

export default HomeSkeleton

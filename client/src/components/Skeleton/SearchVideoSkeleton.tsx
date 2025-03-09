import Skeleton from "./Skeleton";

const SearchVideoSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="animate-pulse flex space-x-4">
          <Skeleton className="h-64 w-[450px] rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 rounded w-3/5" />
            <div className="space-y-1">
              <Skeleton className="h-4 rounded w-1/3" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 rounded w-1/4" />
              </div>
              <Skeleton className="h-4 rounded w-4/6" />
              <Skeleton className="h-4 rounded w-4/6" />
              <Skeleton className="h-4 rounded w-4/6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchVideoSkeleton;

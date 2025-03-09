import Skeleton from "./Skeleton";

const SubscriptionSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full overflow-y-auto p-1 md:p-5 relative">
      <div className="absolute right-1 md:right-10">
        <Skeleton className="w-24 h-6" />
      </div>
      {[...Array(3)].map((_, index) => (
        <div key={index} className="mb-5">
          <div className="w-full rounded-md bg-gray-200 dark:bg-zinc-500 p-2">
            <div className="flex w-full items-center gap-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="w-1/2 h-8" />
            </div>
            <div className="flex flex-wrap md:flex-nowrap gap-4 ">
            <Skeleton className="w-full md:w-64 h-32 mt-2" />
                <div className="w-full md:w-[50%]">
                    <Skeleton className="w-full h-4 mt-2" />
                    <Skeleton className="w-full h-4 mt-2" />
                    <Skeleton className="w-full h-4 mt-2" />
                </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionSkeleton;
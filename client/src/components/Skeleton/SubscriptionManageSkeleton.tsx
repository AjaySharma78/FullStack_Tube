import Skeleton from "./Skeleton";

const SubscriptionManageSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full overflow-y-auto p-1 md:p-5 relative">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="w-full flex justify-between items-center mb-3 p-1 md:p-3 bg-gray-200 dark:bg-zinc-600 rounded-md"
        >
          <div className="relative w-14 h-14 md:w-32 md:h-32 text-gray-700">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
          <div className="flex flex-col w-[50%] md:w-[60%] text-gray-700">
            <Skeleton className=" md:w-1/2 h-5 md:h-8 mb-2" />
            <Skeleton className="w-2/3 md:w-1/3 h-3 md:h-6 mb-2" />
            <Skeleton className="w-full h-3 md:h-4 mb-2" />
            <Skeleton className="w-full h-3 md:h-4 mb-2" />
          </div>
          <Skeleton className="w-[20%] h-7 md:h-10 rounded-full text-gray-700" />
        </div>
      ))}
    </div>
  );
};

export default SubscriptionManageSkeleton;
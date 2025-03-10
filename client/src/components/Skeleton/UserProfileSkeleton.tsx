import Skeleton from "./Skeleton";

const UserProfileSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="mx-2 md:mx-14  mt m-5">
      <div className="relative w-full h-28 md:h-52">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>
        <div className="w-full h-28 md:h-44 my-5 flex items-start justify-start gap-5">
          <div className="relative w-28 md:w-44 h-full rounded-full">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
          <div className="w-3/5">
            <Skeleton className="w-4/5 h-8 mb-2" />
            <Skeleton className="w-1/3 h-6 mb-2" />
            <Skeleton className="w-1/3 h-4 mb-2" />
            <Skeleton className="w-1/4 h-8 rounded-full md:mt-8" />
          </div>
        </div>
      </div>
      <div className="w-full flex items-center justify-start md:px-14 p-1 sticky top-0 border-b-2 bg-gray-100 dark:bg-black z-[5]">
        <nav>
          <ul className="flex gap-5 p-1 font-semibold text-gray-600">
            <Skeleton className="w-20 h-6" />
            <Skeleton className="w-20 h-6" />
            <Skeleton className="w-20 h-6" />
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default UserProfileSkeleton;
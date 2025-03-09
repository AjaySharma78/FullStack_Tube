import Skeleton from "./Skeleton";

const UserProfileSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="mx-14 mt m-5">
        <div className="w-full h-52">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>
        <div className="w-full h-44 my-5 flex items-start justify-start gap-5">
          <div className="w-[17%] h-full">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
          <div className="w-[83%]">
            <Skeleton className="w-1/2 h-8 mb-2" />
            <Skeleton className="w-1/3 h-6 mb-2" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-1/4 h-10 rounded-full mt-8" />
          </div>
        </div>
      </div>
      <div className="w-full flex items-center justify-start px-14 p-1 sticky top-0 border-b-2 bg-gray-100 dark:bg-black z-[5]">
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
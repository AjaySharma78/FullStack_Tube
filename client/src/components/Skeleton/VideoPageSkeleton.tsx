import Skeleton from "./Skeleton";

const VideoPageSkeleton: React.FC = () => {
  return (
    <div className="w-full h-screen overflow-y-auto bg-gray-100 dark:bg-zinc-800 ">
      <div className="flex flex-wrap lg:flex-nowrap w-full">
        {/* left */}
        <div className="w-full lg:w-3/5 m-1 md:m-4">
          <div className="relative object-cover rounded-md">
            <Skeleton className="w-full h-44 md:h-96 rounded-md" />
          </div>

          <div className="mt-2">
            <Skeleton className="w-3/4 h-8 mb-2" />
            <div className="flex items-center mt-2">
              <div className="flex items-center w-3/5">
                <Skeleton className="w-14 h-14 mx-2 rounded-full" />
                <div className="mx-2">
                  <Skeleton className="w-24 h-6 mb-1" />
                  <Skeleton className="w-16 h-4" />
                </div>
              </div>
              <div className="relative flex items-center justify-between w-2/5">
                <Skeleton className="w-24 h-8 rounded-full" />
                <Skeleton className="w-24 h-8 rounded-full" />
              </div>
            </div>
          </div>

          <div className="lg:m-2 lg:p-4 rounded-md bg-gray-200 dark:bg-zinc-800 ">
            <Skeleton className="w-1/2 h-4 mb-2" />
            <Skeleton className="w-full h-20" />
          </div>

          <div className="mt-2 lg:m-2 lg:p-2 rounded-md">
            <Skeleton className="w-1/4 h-6 mb-2" />
            <Skeleton className="w-full h-12 mb-2" />
            <Skeleton className="w-full h-12 mb-2" />
            <Skeleton className="w-full h-12 mb-2" />
          </div>
        </div>

        {/* right */}
        <div className="w-full lg:w-2/5 m-2 lg:m-4">
          <div className="mb-8">
            <div className="bg-gray-200 p-2 dark:bg-zinc-800 ">
              <Skeleton className="w-3/4 h-8 mb-2" />
              <Skeleton className="w-full h-4 mb-1" />
              <Skeleton className="w-1/2 h-4" />
            </div>

            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-start p-2">
                <Skeleton className="w-52 h-28 rounded-md" />
                <div className="ml-2 ">
                  <Skeleton className="w-48 h-6 mb-1" />
                  <Skeleton className="w-32 h-4 mb-1" />
                  <Skeleton className="w-28 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPageSkeleton;

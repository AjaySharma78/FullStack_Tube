import Skeleton from "./Skeleton";

const ProfileSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full">
      <div className="mx-2 md:mx-14 mt-2 md:mt-5">
        <div className="relative w-full h-28 md:h-52">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>
        <div className="w-full h-28 md:h-44 my-5 flex items-start justify-start gap-5">
          <div className="relative w-28 md:w-44 h-full rounded-full">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
          <div className="w-3/5">
            <Skeleton className="w-1/2 h-8 mb-2" />
            <Skeleton className="w-1/3 h-6 mb-2" />
            <Skeleton className="w-1/3 h-6 mb-2" />
          </div>
        </div>
        <div className="w-full my-5">
          <table className="min-w-full bg-white dark:bg-zinc-700">
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b border-gray-200 dark:border-zinc-600">
                  <Skeleton className="w-20 h-4" />
                </td>
                <td className="py-2 px-4 border-b border-gray-200 dark:border-zinc-600">
                  <Skeleton className="w-full h-4" />
                </td>
                <td className="py-2 px-4 border-b border-gray-200 dark:border-zinc-600">
                  <Skeleton className="w-5 h-5" />
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b border-gray-200 dark:border-zinc-600">
                  <Skeleton className="w-20 h-4" />
                </td>
                <td className="py-2 px-4 border-b border-gray-200 dark:border-zinc-600">
                  <Skeleton className="w-full h-4" />
                </td>
                <td className="py-2 px-4 border-b border-gray-200 dark:border-zinc-600">
                  <Skeleton className="w-5 h-5" />
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b border-gray-200 dark:border-zinc-600">
                  <Skeleton className="w-20 h-4" />
                </td>
                <td className="py-2 px-4 border-b border-gray-200 dark:border-zinc-600">
                  <Skeleton className="w-full h-4" />
                </td>
                <td className="py-2 px-4 border-b border-gray-200 dark:border-zinc-600">
                  <Skeleton className="w-5 h-5" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
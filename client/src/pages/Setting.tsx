import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store/store";
import { darkTheme, lightTheme, systemTheme } from "../app/api/slice/authSlice";
import { toast } from "sonner";
import { deleteWatchHistory } from "../app/api/videoApi";

const Setting = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.auth.theme);
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const clearHistory = () => {
    console.log("Clearing history")
    toast.promise<string>(
      new Promise<string>(async(resolve, reject) => {
        try {
          const response = await deleteWatchHistory()
          console.log(response)
          if(!response.success) {
            reject(response.message)
          }
          resolve(response.message)
        } catch (error) {
          reject("Failed to clear history")
        }
      }),
      {
        loading: "Clearing history...",
        success: (message: string) => message,
        error: (message: string) => message
      }
    )
  }
  return (
    <div className="w-full h-screen p-5">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold py-4 dark:text-white ">Setting</h1>
      </div>
      <div className="w-full md:w-1/2 my-5">
        <table className="min-w-full rounded-md bg-white dark:bg-zinc-700  dark:text-white">
          <tbody>
            <tr>
              <td className="py-2 px-4 text-xs md:text-sm lg:text-base ">
                Choose your Mode
              </td>
              <td className="py-2 ">
                <div className="flex gap-2 justify-center text-xs md:text-base">
                  <button
                    onClick={() => dispatch(lightTheme())}
                    className={`p-1 lg:px-2  rounded-full flex items-center gap-1 ${
                      theme === "light"
                        ? "bg-gray-300 "
                        : "bg-gray-100 dark:bg-black"
                    }`}
                  >
                    ☀️{" "}
                    <span
                      className={`${
                        theme === "light" ? "block" : "hidden"
                      } lg:block`}
                    >
                      Light
                    </span>
                  </button>
                  <button
                    onClick={() => dispatch(darkTheme())}
                    className={`p-1 lg:px-2  rounded-full flex items-center gap-1 ${
                      theme === "dark"
                        ? "bg-gray-300 dark:bg-gray-600"
                        : "bg-gray-100 dark:bg-black"
                    }`}
                  >
                    🌙{" "}
                    <span
                      className={`${
                        theme === "dark" ? "block" : "hidden"
                      } lg:block`}
                    >
                      Dark
                    </span>
                  </button>
                  <button
                    onClick={() => dispatch(systemTheme())}
                    className={`p-1 lg:px-2  rounded-full flex items-center gap-1 dark:bg-black ${
                      theme === "system"
                        ? "bg-gray-300 dark:bg-gray-600"
                        : "bg-gray-100"
                    }`}
                  >
                    🖥️{" "}
                    <span
                      className={`${
                        theme === "system" ? "block" : "hidden"
                      } lg:block`}
                    >
                      System
                    </span>
                  </button>
                </div>
              </td>
            </tr>
           {authStatus && <tr>
              <td className="py-2 px-4 text-xs md:text-sm lg:text-base ">
                Clear WatchHistory
              </td>
              <td className="py-2 text-right pr-12" rowSpan={2}>
                <button className="p-1 lg:px-2 rounded-full bg-gray-100 dark:bg-black" onClick={clearHistory}>
                  Clear History
                </button>
              </td>
              </tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Setting;

import VideoCard from "./Video/VideoCard";
import { useDispatch, useSelector } from "react-redux";
import { addVideoToPlaylist } from "../app/api/playListApis";
import { useEffect, useState } from "react";
import Swiper from "swiper";
import { WatchVideo } from "../interface/watchHistoryInterface";
import "swiper/swiper-bundle.css";
import { setPlaylist } from "../app/api/slice/playlistSlice";
import { toast } from "sonner";

export interface CarouselProps {
  slides: WatchVideo[];
  gridView: boolean;
}
const Carousel:React.FC<CarouselProps>=(
  {slides, gridView}
  )=> {
  useEffect(() => {
    new Swiper(".mySwiper", {
      slidesPerView: 4,
      spaceBetween: 10,
      loop: false,
      grabCursor: true,
      freeMode: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        300: {
            slidesPerView: 2.5,
            spaceBetween:5,
        },
        720: {
            slidesPerView: 3,
        },
        999: {
            slidesPerView: 4,
        },
      
    }
    });
  }, [gridView]);

  const playList = useSelector((state: any) => state.playlist.playLists);
  const user = useSelector((state: any) => state.auth.user);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [playlistMenuVisible, setPlaylistMenuVisible] = useState(null);
  const dispatch = useDispatch();
  const toggleMenu = (videoId: any) => {
    setMenuVisible(menuVisible === videoId ? null : videoId);
    setPlaylistMenuVisible(null);
  };

  const togglePlaylistMenu = (id: any) => {
    setPlaylistMenuVisible((prev) => (prev === id ? null : id));
  };

  const handleAddToPlaylist = async (playlistId: string, videoId: string) => {
    try {
      const response = await addVideoToPlaylist(playlistId, videoId);
      if (response.message === "Video added to playlist successfully") {
        toast.success("Video added to playlist successfully");
      } else if (
        response.message === "Playlist created and video added successfully"
      ) {
        toast.success("Playlist created and video added successfully");
         dispatch(setPlaylist([...playList,response.data]));
      }else if(response.message === "Video already added to playlist"){
        toast.warning("Video already in playlist");
      }
      setPlaylistMenuVisible(null);
      setMenuVisible(null);
    } catch (error) {
      toast.error("Failed to add video to playlist");
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      {gridView ? (
         <section className="w-full h-full overflow-y-auto">
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
           {slides.map((data) => (
             <VideoCard
             isWatchHistoryPage={true}
             playList={playList}
             video={{
               ...data,
               isLiked: false,
               isDisliked: false,
               numberoflikes: 0,
               numberofdislike: 0,

               videoOwner: {
                 ...data.videoOwner,
                 isSubscribed: false,
                 subscriberCount: 0,
               },
             }}
             key={data._id}
             user={user}
             toggleMenu={() => toggleMenu(data._id)}
             togglePlaylistMenu={() => togglePlaylistMenu(data._id)}
             menuVisible={menuVisible}
             playlistMenuVisible={playlistMenuVisible}
             handleAddToPlaylist={(playListId: string) =>
               handleAddToPlaylist(playListId, data._id)
             }
             />
           ))}
         </div>
       </section>
      ) : (
        <div className="w-full h-full flex justify-center items-center py-5"> 
        <div className="swiper mySwiper w-full">
          <div className="swiper-wrapper">
            {slides.slice(0, 6).map((data, index) => (
              <div className="swiper-slide" key={index}>
                <VideoCard
                  isWatchHistoryPage={true}
                  playList={playList}
                  video={{
                    ...data,
                    isLiked: false,
                    isDisliked: false,
                    numberoflikes: 0,
                    numberofdislike: 0,

                    videoOwner: {
                      ...data.videoOwner,
                      isSubscribed: false,
                      subscriberCount: 0,
                    },
                  }}
                  key={data._id}
                  user={user}
                  toggleMenu={() => toggleMenu(data._id)}
                  togglePlaylistMenu={() => togglePlaylistMenu(data._id)}
                  menuVisible={menuVisible}
                  playlistMenuVisible={playlistMenuVisible}
                  handleAddToPlaylist={(playListId: string) =>
                    handleAddToPlaylist(playListId, data._id)
                  }
                />
              </div>
            ))}
          </div>
          <div className="swiper-pagination"></div>
        </div>
        </div>
      )}
    </div>

  );
}

export default Carousel;

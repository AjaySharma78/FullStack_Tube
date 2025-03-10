import { useRef, useEffect } from "react";
import "video.js/dist/video-js.css";
import videojs from "video.js";

interface VideoPlayerProps {
  options: any;
  onReady?: (player: any) => void;
}

export const VideoPlayer = ({ options, onReady }: VideoPlayerProps) => {
  const videoRef = useRef<any | null>(null);
  const playerRef = useRef<any | null>(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoElement.classList.add("vjs-16-9");
      videoElement.style.borderRadius = "8px";
      videoRef.current.innerHTML = "";
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        if (onReady) onReady(player);
      }));
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef]);

  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player className=" w-full h-full rounded-md">
      <div ref={videoRef} className="rounded-md"></div>
    </div>
  );
};

export default VideoPlayer;


import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store/store';
import { Video } from '../../../interface/videointerface';
import { PlayListProps } from '../../../interface/playlistprops';
interface VideoState {
  videos: Video[];
  playlistvideos: Video[];
  playLists: PlayListProps[];
}

const initialState: VideoState = {
  videos: [],
  playlistvideos: [],
  playLists:[],
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setVideos(state, action: PayloadAction<Video[]>) {
      state.videos = action.payload;
    },
    addVideo(state, action: PayloadAction<Video>) {
      state.videos.push(action.payload);
    },
    updateVideo(state, action: PayloadAction<Video>) {
      const index = state.videos.findIndex(video => video._id === action.payload._id);
      if (index !== -1) {
        state.videos[index] = action.payload;
      }
    },
    removeVideo(state, action: PayloadAction<string>) {
      state.videos = state.videos.filter(video => video._id !== action.payload);
    },
  },
});

export const { setVideos, addVideo, updateVideo, removeVideo } = videoSlice.actions;

export default videoSlice.reducer;

export const currentVideos = (state: RootState) => state.video.videos;
export const currentPlayList = (state: RootState) => state.video.playLists;

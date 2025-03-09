import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store/store';
import { Video } from '../../../interface/videointerface';
import { PlayListProps } from '../../../interface/playlistprops';

export interface CarouselProps {
  slides: Video[];
  gridView: boolean;
}
interface VideoState {
  playlistvideos: Video[];
  playLists: PlayListProps[];
  WatchHistory: CarouselProps[];
  LikeHistory: CarouselProps[];
  searchVideos: Video[];
}

const initialState: VideoState = {
  playlistvideos: [],
  playLists:[],
  WatchHistory: [],
  LikeHistory: [],
  searchVideos: []
};

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setPlaylistVideos(state, action: PayloadAction<Video[]>) {
      state.playlistvideos = action.payload;
    },
    setPlaylist(state, action: PayloadAction<PlayListProps[]>) {
      state.playLists = action.payload;
    },
    setWatchHistory(state, action: PayloadAction<CarouselProps[]>) {
      state.WatchHistory = action.payload;
    },
    setLikeHistory(state, action: PayloadAction<CarouselProps[]>) {
      state.LikeHistory = action.payload;
    },
    setSearchVideos(state, action: PayloadAction<Video[]>) {
      state.searchVideos = action.payload;
    }
  },
});

export const {setPlaylistVideos, setPlaylist, setWatchHistory, setLikeHistory, setSearchVideos } = playlistSlice.actions;

export default playlistSlice.reducer;

export const currentPlaylistVideos = (state: RootState) => state.playlist.playlistvideos;
export const currentPlayList = (state: RootState) => state.playlist.playLists;
export const currentWatchHistory = (state: RootState) => state.playlist.WatchHistory;
export const currentLikeHistory = (state: RootState) => state.playlist.LikeHistory;
export const currentSearchVideos = (state: RootState) => state.playlist.searchVideos;

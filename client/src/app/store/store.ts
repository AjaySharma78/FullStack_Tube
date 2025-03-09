import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../api/slice/authSlice.ts';
import videoReducer from '../api/slice/videoSlice.ts';
import playlistReducer from '../api/slice/playlistSlice.ts';
const store = configureStore({
    reducer: {
        auth: authReducer,
        video: videoReducer,
        playlist: playlistReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store.ts';
import {UserProps, AuthStateProps} from '../../../interface/sliceInterface.ts';
import Cookies from 'js-cookie';

const initialState: AuthStateProps = {
    user:null,
    accessToken: null,
    refreshToken: null,
    status: false,
    theme: localStorage.getItem('theme')||"light",
    // tweetEnabled: JSON.parse(localStorage.getItem('tweetEnabled') || 'false'),
};
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: UserProps; accessToken: string; refreshToken: string }>) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.status = true;
        },
        setUser: (state, action: PayloadAction<UserProps | any>) => {
            state.user = action.payload;
        },
        logOut: (state) => {
            Cookies.remove('status')
            state.status = false;
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
        },
        lightTheme: (state) => {
            state.theme = "light";
            localStorage.setItem("theme", "light");
          },
      
          darkTheme: (state) => {
            state.theme = "dark";
            localStorage.setItem("theme", "dark");
          },
      
          systemTheme: (state) => {
            state.theme = "system";
            localStorage.setItem("theme", "system");
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.classList.remove("light", "dark", "system");
            if (isDark) {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.add("light");
            }
        },
        // setTweetEnabled: (state, action: PayloadAction<boolean>) => {
        //     state.tweetEnabled = action.payload;
        //     localStorage.setItem('tweetEnabled', JSON.stringify(action.payload)); 
        // }
    },
});

export const { setCredentials, logOut, setUser, systemTheme, lightTheme, darkTheme } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.accessToken;
export const selectCurrentStatus = (state: RootState) => state.auth.status;

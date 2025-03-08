import api from "./slice/apiSlice";

export const userPlaylist = async (userId: string) => {
    try {
        const response = await api.get(`/playlists/get-user-playlist/${userId}`) 
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const addVideoToPlaylist = async (playlistId:string,videoId:string) => {
    try {
        const response = await api.patch('/playlists/add-remove/video/playlist',{playlistId, videoId});
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const removeVideoFromPlaylist = async (playlistId:string,videoId:string) => {
    try {
        const response = await api.delete('/playlists/add-remove/video/playlist',{data: { playlistId, videoId }});
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const deleteAllVideoFromPlaylist = async (playlistId:string) => {
    try {
        const response = await api.patch(`/playlists/remove-all-video/playlist/${playlistId}`);
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const deletePlaylist = async (playlistId:string) => {
    try {
        const response = await api.delete(`/playlists/remove-all-video/playlist/${playlistId}`);
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}
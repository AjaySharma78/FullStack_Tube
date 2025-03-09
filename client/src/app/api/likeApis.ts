import api from "./slice/apiSlice";

export const toggleVideoLike = async (videoId: string) => {
    try {
        const response = await api.patch(`/likes/toggle/v/${videoId}`);
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const toggleCommentLike = async (commentId: string) => {
    try {
        const response = await api.patch(`/likes/toggle/v/c/${commentId}`);
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const getLikeVideos = async () => {
    try {
        const response = await api.get('/likes/videos');
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}
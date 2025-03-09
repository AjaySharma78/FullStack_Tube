import api from "./slice/apiSlice";

export const toggleVideoDislike = async (videoId: string) => {
    try {
        const response = await api.patch(`/dislikes/toggle/v/${videoId}`);
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const toggleCommentDislike = async (commentId: string) => {
    try {
        const response = await api.patch(`/dislikes/toggle/v/c/${commentId}`);
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}
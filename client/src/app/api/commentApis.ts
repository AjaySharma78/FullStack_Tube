import api from "./slice/apiSlice";

export const getVideoComments = async (videoId:string,userId: string ) => {
    try {
        const response = await api.get(
            `/comments/v/${videoId}/${userId}`
          );
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const postVideoComment = async (videoId:string,newComment: string ) => {
    try {
        const response = await api.post(`/comments/v/${videoId}`, {
            content: newComment,
          });
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const updateVideoComment = async (commentId:string,editingCommentText: string ) => {
    try {
        const response = await api.patch(`/comments/v/${commentId}`, {
            content: editingCommentText,
          });
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const deleteVideoComment = async (commentId:string) => {
    try {
        const response = await api.delete(`/comments/v/${commentId}`);
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}
import { VideoUploadInterface } from "../../interface/videoUploadInterface";
import api from "./slice/apiSlice";

export const getVideo = async (videoId: string,userId: string) => {
    try {
        const response = await api.get(`/videos/${videoId}/${userId}`);
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const getVideos = async (currentPage?:number,query?:string) => {
    try {
        const response = await api.get(`/videos`,{
            params: {
                pageNumber: currentPage,
                query:query
            },
        });
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const increaseVideoViews = async (videoId:string) => {
    try {
        const response = await api.patch(`/videos/${videoId}/increment-views`);
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const getUserAllVideos = async () => {
    try {
        const response = await api.get('/videos/user-all-video');
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}


export const toggleVideoPublish = async (videoId:string) => {
    try {
        const response = await api.patch(`/videos/${videoId}/toggle-status`);
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const uploadVideo = async (data:VideoUploadInterface) => {
    try {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('isPublished', data.isPublished.toString());
        formData.append('thumbnail', data.thumbnail[0]);
        formData.append('video', data.video[0]);
        const response = await api.post('/videos',formData,{
            headers: {
                'Content-Type': 'multipart/form-data',
            }
            },
        );
        return response.data;
    } catch (error:any) {
        console.log(error);
        return error.response.data;
    }
}


export const deleteVideo = async (videoId:string) => {

    try {
        const response = await api.delete(`/videos/${videoId}`);
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const updateVideoTitleDescription = async (videoId:string,data:VideoUploadInterface) => {
    try {
        const response = await api.patch(`/videos/update-title-description/${videoId}`,{title:data.title,description:data.description});
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

interface thumbnail{
    thumbnail:string
}


export const updateThumbnail = async (videoId:string,data:thumbnail) => {
    try {
        const formData = new FormData();
        formData.append('thumbnail', data.thumbnail[0]);
        const response = await api.patch(`/videos/${videoId}`,formData,{
            headers: {
                'Content-Type': 'multipart/form-data',
            }
            },
        );
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const searchVideo = async (searchQuery:string) => {
    try {
        const response = await api.get(`/videos/search/`,{
            params: {
                query: searchQuery,
            },
        });
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const deleteWatchHistory = async () => {
    try {
        const response = await api.delete(`/users/delete-watch-history`);
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}
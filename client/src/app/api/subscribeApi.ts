import api from "./slice/apiSlice";

export const toggleSubscribe = async (videoOwnerId: string) => {
    try {
        const response = await api.post(
            `/subscriptions/togglesubscription/${videoOwnerId}`
          );
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}


export const getSubscriptions = async () => {
    try {
        const response = await api.get("/subscriptions");
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}

export const getSubscribeedChannels = async () => {
    try {
        const response = await api.get("/subscriptions/channel");
        return response.data;
    } catch (error:any) {
        return error.response.data;
    }
}


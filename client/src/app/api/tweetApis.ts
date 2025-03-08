  import api from "./slice/apiSlice";
  export const allUserTweets = async () => {
    try {
        const response = await api.get("/tweets");
        return response.data;
    } catch (error) {
      return error;
    }
  }

  export const allTweets = async () => {
    try {
        const response = await api.get("/tweets/all");
        return response.data;
    } catch (error) {
      return error;
    }
  }
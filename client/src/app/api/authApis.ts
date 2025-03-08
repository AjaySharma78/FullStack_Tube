import api from "../../app/api/slice/apiSlice";
interface SignupData {
  userName: string;
  fullname: string;
  email: string;
  password: string;
  avatar: File[];
  coverImage: File[];
}
export const login = async (identifier: string, password: string) => {
   try {
     const response = await api.post('/users/login', {identifier, password});
     return response.data;
   } catch (error:any) {
     return error.response.data;
   }
};

export const signup = async (data: SignupData) => {
  try {
    const formData = new FormData();
    formData.append('userName', data.userName);
    formData.append('fullName', data.fullname);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('avatar', data.avatar[0]);
    formData.append('coverImage', data.coverImage[0]);

    const response = await api.post('/users/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
}

export const verifyEmail = async (token:string) =>{
  try {
    const response = await api.post(`/users/verify-email?token=${token}`)
    return response.data
  } catch (error:any) {
    return  error.response.data
  }
}

export const logout = async () => {
  try {
    const response = await api.post('/users/logout');
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/get-current-user');
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
};


export const getUserChannelProfile = async (userName:string,userId:string) => {
  try {
    const response = await api.get(`/users/channel/${userName}`,{
      params:{
          userId: userId
      }
  })   
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
};

export const resetPassword = async (newPassword:string,token:string) => {
  try {
    const response = await api.patch('/users/reset-password',{newPassword,token});
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
};

export const forgotPassword = async (email:string) => {
  try {
    const response = await api.post('/users/forgot-password',{email});
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
};


export const watchHistory = async () => {
  try {
    const response = await api.get('/users/watch-history');
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
}

interface coverImage{
  coverImage:string
  avatar:string
}


export const updateCoverImage = async (data:coverImage) => {
  try {
    const formData = new FormData();
    formData.append('coverImage', data.coverImage[0]);
    const response = await api.patch('/users/update-cover-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
}

export const updateAvatar = async (data:coverImage) => {
  try {
    const formData = new FormData();
    formData.append('avatar', data.avatar[0]);
    const response = await api.patch('/users/update-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
}



export const updateUserInfo = async (data: { userName: string; email: string; fullName:string }) => {
  try {
    const response = await api.patch('/users/update/u/email-username-fullname', data);
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
}

export const resendVerificationEmail = async (email:string) => {
  try {
    const response = await api.post('/users/resend-verification-email',{email});
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
}

export const changePassword = async (oldPassword:string,newPassword:string) => {
  try {
    const response = await api.post('/users/change-password',{oldPassword,newPassword});
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
}

export const validateUserNames = async (userName:string) => {
  try {
    const response = await api.post(`/users/validate-username`,{userName});
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
}

export const disable2FA = async (token:string) => {
  try {
    const response = await api.post('/users/disable-2fa',{token});
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
}

export const enable2FA = async () => {
  try {
    const response = await api.post('/users/generate-2fa-secret');
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
}


export const verify2FAToken = async (userId:string,token:string) => {
  try {
    const response = await api.post('/users/verify-2fa-token',{userId,token});
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
}

export const verify2FA = async (userId:string,backupCode:string) => {
  try {
    const response = await api.post('/users/verify-2fa-token',{userId,backupCode});
    return response.data;
  } catch (error:any) {
    return error.response.data;
  }
}
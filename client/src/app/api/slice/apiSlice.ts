import axios from 'axios';
import { setCredentials, logOut } from './authSlice.ts';
import store from '../../store/store.ts';
import {setupCache} from 'axios-cache-interceptor'
import config from '../../../env/config.ts';

const instance = axios.create({
    baseURL: config.backendEndpoint,
    withCredentials: true,
<<<<<<< HEAD

=======
>>>>>>> 373c80d80295f7f7e0d1af93562d8ee4e413c75c
});
const api = setupCache(instance);


// const api = axios.create({
//     baseURL: 'http://localhost:8000/api/v1',
//     withCredentials: true,
// });

// // api.interceptors.request.use(
// //     config => {
// //         const token = store.getState().auth.accessToken;
// //         if (token) {
// //             config.headers['Authorization'] = `Bearer ${token}`;
// //         }
// //         return config;
// //     },
// //     error => Promise.reject(error)
// // );

// api.interceptors.response.use(
//     response => response,
//     async error => {
//         const originalRequest = error.config;
//         if (error.response.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;
//             try {
//                 const refreshResult = await api.post('/users/refresh-token');
//                 console.log(refreshResult);
//                 if (refreshResult.data.success) {
//                 store.dispatch(setCredentials({user:refreshResult.data.data.user, accessToken: refreshResult.data.data.accessToken, refreshToken:refreshResult.data.data.refreshToken}));
//                     originalRequest.headers['Authorization'] = `Bearer ${refreshResult.data.data.accessToken}`;
//                     return api(originalRequest); 
//                 } else {
//                     store.dispatch(logOut());
//                     return Promise.reject(new Error('Invalid refresh token'));
//                 }
//                     } catch (refreshError) {
//                 store.dispatch(logOut());
//                 return Promise.reject(refreshError);
//             }
//         }
//         else{
//             store.dispatch(logOut());
//             return Promise.reject(error);
//         }
//     }
// );


// const instance = axios.create({
//     baseURL: 'http://localhost:8000/api/v1',
//     withCredentials: true,
//     headers:{
//         'Content-Type': 'application/json'
//     }
// });

// const api = setupCache(instance);
// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.accessToken;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Add a response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
            if (error.response.data.message === "Invalid token" || error.response.data.message === "Token expired") {
                const refreshResponse = await api.post('/users/refresh-token');
                if (refreshResponse.data) {
                    store.dispatch(setCredentials({user:refreshResponse.data.data.user, accessToken: refreshResponse.data.data.accessToken, refreshToken:refreshResponse.data.data.refreshToken}));
                }
                originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.data.accessToken}`;
                return api(originalRequest);
            }
            } catch (refreshError) {
                store.dispatch(logOut());
                return Promise.reject(refreshError);
            }
        } else if (error.response.status === 403 && error.response.data.message === 'Invalid token') {
            // Handle case where refresh token is expired
            store.dispatch(logOut());
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

// api.interceptors.response.use(
//     response => response,
//     async error => {
//       const originalRequest = error.config;
//       if (error.response.status === 401 && !originalRequest._retry) {
//           originalRequest._retry = true;
//         if (error.response.data.message === "Invalid token" || error.response.data.message === "Token expired") {
//           try {
//             const refreshResponse = await api.post('/users/refresh-token');
//             if (refreshResponse.data) {
//               store.dispatch(setCredentials({
//                 user: refreshResponse.data.data.user,
//                 accessToken: refreshResponse.data.data.accessToken,
//                 refreshToken: refreshResponse.data.data.refreshToken,
//               }));
//             }
//             originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.data.accessToken}`;
//             return api(originalRequest);
//           } catch (refreshError) {
//             store.dispatch(logOut());
//             return Promise.reject(refreshError);
//           }
//         } else {
//           // If the error is not related to token expiration, reject the promise
//           return Promise.reject(error);
//         }
//       } else if (error.response.status === 403 && error.response.data.message === "Invalid token") {
//         console.error('Invalid token error:', error);
//         store.dispatch(logOut());
//         return Promise.reject(error);
//       }
//       return Promise.reject(error);
//     }
//   );


export default api;
import axios from 'axios';
import useAuthStore from '@/stores/authStore';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// リクエストインターセプターを追加して、Authorization ヘッダーを自動設定
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    console.log('Access Token from store:', accessToken);
    const excludeUrls = ['/api/v1/auth/sign_in', '/api/v1/auth/sign_up', '/api/v1/auth/refresh'];
    if (accessToken && !excludeUrls.includes(config.url)) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
      console.log('Authorization Header Set:', config.headers['Authorization']);
    } else {
      console.log('No Authorization Header Set for:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプターを追加して、401 エラーをグローバルに処理
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshUrl = '/api/v1/auth/refresh';
    console.log('Response error:', error.response?.status, originalRequest.url);

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes(refreshUrl)
    ) {
      originalRequest._retry = true;
      try {
        const { refreshToken } = useAuthStore.getState();
        console.log('Attempting to refresh token with:', refreshToken);
        if (refreshToken) {
          const response = await axiosInstance.post(refreshUrl, {
            refresh_token: refreshToken,
          });
          const newAccessToken = response.data.access_token;
          console.log('New Access Token obtained:', newAccessToken);
          // 新しいアクセストークンをストアに設定
          useAuthStore.getState().setAccessToken(newAccessToken);
          // 元のリクエストのAuthorizationヘッダーを更新
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          console.log('Retrying original request with new token:', newAccessToken);
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('リフレッシュトークンの更新に失敗しました:', refreshError);
        // リフレッシュトークンの更新に失敗した場合、ストアをリセットしてログアウト
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

import axios from 'axios';

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
    const token = localStorage.getItem('access_token');
    const excludeUrls = ['/api/v1/auth/sign_in', '/api/v1/auth/sign_up', '/api/v1/auth/refresh'];
    if (token && !excludeUrls.includes(config.url)) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization Header Set:', config.headers['Authorization']);
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
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== refreshUrl
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axiosInstance.post(refreshUrl, {
            refresh_token: refreshToken,
          });
          const newAccessToken = response.data.access_token;
          console.log('New Access Token:', newAccessToken);
          localStorage.setItem('access_token', newAccessToken);
          axiosInstance.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('リフレッシュトークンの更新に失敗しました:', refreshError);
        // リフレッシュトークンの更新に失敗した場合、ユーザーをログアウトさせる処理
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

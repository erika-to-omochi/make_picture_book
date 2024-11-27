"use client";

import { useState } from 'react';
import axiosInstance from '../../api/axios';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../stores/authStore';

export default function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const showLoginMessage = useAuthStore((state) => state.showLoginMessage);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post('/api/v1/auth/sign_in', {
        user: {
          email: email,
          password: password,
        },
      });

      const { access_token, refresh_token, user } = response.data;

      // リフレッシュトークンとアクセストークンを保存
      if (access_token && refresh_token) {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        console.log('Access Token:', access_token);
        console.log('Refresh Token:', refresh_token);

        setDebugInfo({ access_token, refresh_token }); // デバッグ情報を保存
      } else {
        console.warn("レスポンスに 'access_token' または 'refresh_token' が含まれていません");
      }

      const userName = user?.data?.attributes?.name;
      if (userName) {
        login(userName);
        localStorage.setItem('userName', userName);
        showLoginMessage(userName);
      } else {
        console.warn("レスポンスに 'user.data.attributes.name' が含まれていません");
      }

      router.push('/');
    } catch (error) {
      console.error("ログインエラー:", error.response || error);
      setErrorMessage('メールアドレスまたはパスワードが正しくありません。');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        <div>
          <label className="block text-bodyText">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-bodyText focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block text-bodyText">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-bodyText focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            autoComplete="current-password"
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-1/2 py-2 px-4 bg-customButton text-white font-semibold rounded-md hover:bg-opacity-80"
          >
            ログイン
          </button>
        </div>
      </form>

      {/* デバッグ情報を表示 */}
      {debugInfo && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h3 className="text-lg font-semibold">デバッグ情報</h3>
          <p>Access Token: {debugInfo.access_token}</p>
          <p>Refresh Token: {debugInfo.refresh_token}</p>
        </div>
      )}
    </div>
  );
}

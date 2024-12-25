"use client";

import { useState } from 'react';
import axiosInstance from '../../api/axios';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../stores/authStore';
import { FcGoogle } from "react-icons/fc";

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
        console.log('Access Token:', access_token);
        console.log('Refresh Token:', refresh_token);

        setDebugInfo({ access_token, refresh_token }); // デバッグ情報を保存
      } else {
        console.warn("レスポンスに 'access_token' または 'refresh_token' が含まれていません");
      }

      const userName = user?.data?.attributes?.name;
      if (userName && access_token && refresh_token) {
        login(userName, access_token, refresh_token);
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

  const handleGoogleLogin = () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    window.location.href = `${apiBaseUrl}/api/v1/auth/google_oauth2`;
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
        <div className="mt-4 text-center">
          <p className="text-sm text-bodyText">
            まだアカウントをお持ちでない方
            <a href="/signup" className="text-blue-500 hover:underline ml-1">新規登録</a>
          </p>
          <p className="text-sm text-bodyText mt-2">
            パスワードを忘れた方
            <a href="/forgot-password" className="text-blue-500 hover:underline ml-1">こちら</a>
          </p>
        </div>
      </form>
      {/* 区切り線 */}
      <div className="flex items-center my-4">
        <hr className="flex-grow border-gray-300" />
        <span className="px-2 text-gray-500 text-sm">または</span>
        <hr className="flex-grow border-gray-300" />
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={handleGoogleLogin}
          className="w-1/2 py-2 px-4 bg-white text-black font-semibold rounded-md hover:bg-gray-100 flex items-center justify-center"
        >
          <FcGoogle className="mr-2" size={24} />
          Googleでログイン
        </button>
      </div>
    </div>
  );
}

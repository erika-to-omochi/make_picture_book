"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../stores/authStore';

export default function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const showLoginMessage = useAuthStore((state) => state.showLoginMessage);  // 追加
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/sign_in', {
        user: {
          email: email,
          password: password,
        }
      });

      const userName = response.data.user?.data?.attributes?.name;
      if (userName) {
        login(userName);  // Zustand の login メソッドを呼び出し
        localStorage.setItem('userName', userName);

        // ログインメッセージを表示
        showLoginMessage(userName);
      } else {
        console.warn("レスポンスに 'user.data.attributes.name' が含まれていません");
      }

      router.push('/');
    } catch (error) {
      setErrorMessage('メールアドレスまたはパスワードが正しくありません。');
    }
  };

  return (
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
  );
}

"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
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

      // アクセストークンとユーザー名をlocalStorageに保存
      localStorage.setItem('accessToken', response.data.access_token);
      if (response.data.user && response.data.user.data && response.data.user.data.attributes && response.data.user.data.attributes.name) {
        localStorage.setItem('userName', response.data.user.data.attributes.name);
      } else {
        console.warn("レスポンスに'user.data.attributes.name'が含まれていません");
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
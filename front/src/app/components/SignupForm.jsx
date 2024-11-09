"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessages, setErrorMessages] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth', {
        user: {
          name: name,
          email: email,
          password: password,
          password_confirmation: confirmPassword,
        },
      });

      // 成功時の処理
      setSuccessMessage(response.data.message);
      setErrorMessages([]); // エラーメッセージをクリア

      localStorage.setItem('accessToken', response.data.access_token);
      localStorage.setItem('userName', name);

      router.push('/');
    } catch (error) {
      // エラー時の処理
      if (error.response?.data?.errors) {
        setErrorMessages(error.response.data.errors);
      } else {
        setErrorMessages(['登録に失敗しました']);
      }
      setSuccessMessage(null);
    }
  };

  return (
    <div>
      {errorMessages.length > 0 && (
        <ul className="text-red-500">
          {errorMessages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      )}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-bodyText">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-bodyText focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
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
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-bodyText">パスワード確認</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-bodyText focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            autoComplete="new-password"
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-1/2 py-2 px-4 bg-customButton text-white font-semibold rounded-md hover:bg-opacity-80"
          >
            新規登録
          </button>
        </div>
      </form>
    </div>
  );
}

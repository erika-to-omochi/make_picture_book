"use client";

import { useState } from 'react';

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-bodyText">名前</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-bodyText focus:outline-none focus:ring-2 focus:ring-blue-400" /* テキストカラー適用 */
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
        />
      </div >
      <div className="flex justify-center">
        <button
          type="submit"
          className="w-1/2 py-2 px-4 bg-customButton text-white font-semibold rounded-md hover:bg-opacity-80"
        >
          新規登録
        </button>
      </div>
    </form>
  );
}

"use client";
import { useState } from "react";
import axiosInstance from '../../api/axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await axiosInstance.post(`/api/v1/auth/password`, {
        user: { email },
      });

      if (response.status === 200) {
        setMessage("パスワード再設定用のメールを送信しました。メールを確認してください。");
        setEmail("");
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);
        // サーバーエラーがあれば表示
        if (error.response && error.response.data && error.response.data.error) {
          setMessage("エラー: " + error.response.data.error);
        } else {
          setMessage("リクエストに失敗しました。もう一度お試しください。");
        }
      }
    };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-customBackground p-6 rounded-lg shadow-md">
        <div className="flex justify-center">
        <h1 className="text-2xl text-heading font-bold mb-4">パスワードリセット申請</h1>
        </div>
        <div className="mb-4">
          <label className="block text-bodyText mb-2">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-customButton text-white px-4 py-2 rounded-md hover:bg-opacity-80"
          >
            送信
          </button>
        </div>
        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}

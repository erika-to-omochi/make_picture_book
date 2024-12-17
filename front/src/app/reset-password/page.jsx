"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../../api/axios";

export default function ResetPasswordPage({ searchParams }) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(""); // エラーメッセージ用
  const router = useRouter();

  const token = searchParams.token;
  const email = searchParams.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // クライアントサイドのバリデーション
    if (password.length < 6) {
      setError("パスワードは6文字以上である必要があります。");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("パスワードと確認用パスワードが一致しません。");
      return;
    }

    try {
      const response = await axiosInstance.put(`/api/v1/auth/password`, {
        user: {
          reset_password_token: token,
          password: password,
          password_confirmation: passwordConfirmation,
        },
      });

      if (response.status === 200) {
        alert("パスワードがリセットされました。ログインしてください。");
        router.push("/login");
      } else {
        setMessage("エラー: サーバーからのリクエストが失敗しました。");
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);

      // サーバーエラーがある場合はメッセージを設定
      if (error.response?.data?.errors) {
        setMessage(error.response.data.errors.join(", "));
      } else {
        setMessage("リクエストに失敗しました。");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-customBackground p-6 rounded-lg shadow-md"
      >
        <div className="flex justify-center">
          <h1 className="text-2xl text-heading font-bold mb-4">新しいパスワードの設定</h1>
        </div>
        <div className="mb-4">
          <label className="block text-bodyText mb-2">新しいパスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-bodyText mb-2">パスワード確認</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-customButton text-white px-4 py-2 rounded-md hover:bg-opacity-80"
          >
            パスワードを再設定
          </button>
        </div>
        {message && <p className="mt-4 text-sm text-red-500">{message}</p>}
      </form>
    </div>
  );
}

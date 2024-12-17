"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage({ searchParams }) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const token = searchParams.token;
  const email = searchParams.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            reset_password_token: token,
            password: password,
            password_confirmation: passwordConfirmation,
          },
        }),
      });

      if (response.ok) {
        alert("パスワードがリセットされました。ログインしてください。");
        router.push("/login");
      } else {
        const errorData = await response.json();
        setMessage("エラー: " + errorData.error);
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);
      setMessage("リクエストに失敗しました。");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">新しいパスワードの設定</h1>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">新しいパスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">パスワード確認</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          パスワードをリセット
        </button>
        {message && <p className="mt-4 text-sm text-red-500">{message}</p>}
      </form>
    </div>
  );
}

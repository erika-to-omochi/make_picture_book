"use client";

import SignupForm from '../components/SignupForm';
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
  const handleGoogleLogin = () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    window.location.href = `${apiBaseUrl}/api/v1/auth/google_oauth2`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white bg-opacity-50 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-heading text-center mb-4">新規登録</h2>
        <SignupForm />
        <div className="mt-4 text-center">
          <p className="text-sm text-bodyText">
            既にアカウントをお持ちですか？
            <a href="/login" className="text-blue-500 hover:underline ml-1">ログイン</a>
          </p>
        </div>
        {/* 区切り線 */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500 text-sm">または</span>
          <hr className="flex-grow border-gray-300" />
        </div>
        {/* Googleログインボタン */}
        <div className="flex justify-center">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2 px-4 bg-white text-black font-semibold rounded-md hover:bg-gray-100 flex items-center justify-center"
          >
            <FcGoogle className="mr-2" size={24} />
            Googleでログイン
          </button>
        </div>
      </div>
    </div>
  );
}

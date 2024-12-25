"use client";

import LoginForm from '../components/LoginForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* 登録フォーム */}
      <div className="max-w-md w-full bg-white bg-opacity-50 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-heading text-center mb-4">ログイン</h2>
        <LoginForm />
      </div>
    </div>
  );
}

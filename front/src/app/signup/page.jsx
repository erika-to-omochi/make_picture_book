"use client";

import SignupForm from '../components/SignupForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* 登録フォーム */}
      <div className="max-w-md w-full bg-white bg-opacity-50 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-heading text-center mb-4">新規登録</h2>
        <SignupForm />
        <div className="mt-4 text-center">
          <p className="text-sm text-bodyText">
            既にアカウントをお持ちですか？
            <a href="/login" className="text-blue-500 hover:underline ml-1">ログイン</a>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import LoginForm from '../components/LoginForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* 登録フォーム */}
      <div className="max-w-md w-full bg-white bg-opacity-50 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-heading text-center mb-4">ログイン</h2>
        <LoginForm />
        <div className="mt-4 text-center">
          <p className="text-sm text-bodyText">
            まだアカウントをお持ちでない方
            <a href="/rr" className="text-blue-500 hover:underline ml-1">新規登録</a>
          </p>
          <p className="text-sm text-bodyText mt-2">
            パスワードを忘れた方
            <a href="/forgot-password" className="text-blue-500 hover:underline ml-1">こちら</a>
          </p>
        </div>
      </div>
    </div>
  );
}

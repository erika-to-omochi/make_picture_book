'use client';

import React, { Suspense, useEffect } from 'react';
import MyPage from './MyPage';
import useAuthStore from '@/stores/authStore';
import useBooksStore from "@/stores/booksStore";

export default function Page() {
  const rowStyles = [
    { zIndex: 2 }, // 列1: 絵本下段
    { zIndex: 4 }, // 列2: 絵本中段
    { zIndex: 6 }, // 列3: 絵本上段
  ];
  // useAuthStoreをコンポーネント内で呼び出す
  const userName = useAuthStore((state) => state.userName);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setUserName = useAuthStore((state) => state.setUserName);

  const loading = useBooksStore((state) => state.loading);

  // クライアントサイドで userName を初期化
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, [setUserName]);

  return (
    <div>
      <header className="w-full mt-4">
        <h1 className="text-center text-3xl font-bold mb-2">{userName}さんの絵本</h1>
      </header>
      <div className="relative flex justify-center">

        {/* BookListPageを特定のレイヤーに挟む */}
        <div className="relative">
          <Suspense fallback={null}>
            <MyPage rowStyles={rowStyles} />
          </Suspense>
        </div>

        {/* ローディングオーバーレイ */}
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">絵本を読込中</p>
              <span className="loading loading-dots loading-lg mt-2 animate-pulse"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

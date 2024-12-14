'use client';

import React, { Suspense, useEffect } from 'react';
import MyPage from './MyPage';
import useAuthStore from '../../stores/authStore';

export default function Page() {
  // useAuthStoreをコンポーネント内で呼び出す
  const userName = useAuthStore((state) => state.userName);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setUserName = useAuthStore((state) => state.setUserName);

  // クライアントサイドで userName を初期化
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, [setUserName]);

  return (
    <div>
      <header className="w-full mt-8">
        <h1 className="text-center text-3xl font-bold">{userName}さんの絵本</h1>
      </header>
      <div className="relative flex justify-center">
        <img
          src="/home/bookSherf.png"
          alt="Book Shelf"
          className="absolute left-1/2 transform -translate-x-1/2 w-[950px] h-[950px] object-contain pointer-events-none max-w-none max-h-none"
        />
        <div className="relative mt-[64px]">
          <Suspense fallback={<div>Loading...</div>}>
            <MyPage />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

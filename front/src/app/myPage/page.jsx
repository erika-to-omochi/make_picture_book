'use client';

import React, { Suspense, useEffect } from 'react';
import MyPage from './MyPage';
import useAuthStore from '../../stores/authStore';

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
        <img
          src="/home/bookSherf1.png"
          alt="Book Shelf Bottom"
          className="absolute top-[-92px] left-1/2 transform -translate-x-1/2 w-[824px] h-[824px] object-contain pointer-events-none max-w-none max-h-none"
          style={{ zIndex: 7 }}
        />
        <img
          src="/home/bookSherf2.png"
          alt="Book Shelf Middle"
          className="absolute top-[-92px] left-1/2 transform -translate-x-1/2 w-[824px] h-[824px] object-contain pointer-events-none max-w-none max-h-none"
          style={{ zIndex: 5 }}
        />
        <img
          src="/home/bookSherf3.png"
          alt="Book Shelf Top"
          className="absolute top-[-92px] left-1/2 transform -translate-x-1/2 w-[824px] h-[824px] object-contain pointer-events-none max-w-none max-h-none"
          style={{ zIndex: 3 }}
        />
        <img
          src="/home/bookSherf4.png"
          alt="Book Shelf Highest"
          className="absolute top-[-92px] left-1/2 transform -translate-x-1/2 w-[824px] h-[824px] object-contain pointer-events-none max-w-none max-h-none"
          style={{ zIndex: 1 }}
        />
        <div className="relative">
          <Suspense fallback={<div>Loading...</div>}>
            <MyPage rowStyles={rowStyles} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { Suspense } from 'react';
import BookListPage from './BookListPage';
import useBooksStore from "@/stores/booksStore";

export default function Page() {
  const rowStyles = [
    { zIndex: 2 },
    { zIndex: 4 },
    { zIndex: 6 },
  ];

  const loading = useBooksStore((state) => state.loading);

  return (
    <div>
      <header className="w-full mt-4">
        <h1 className="text-center text-3xl font-bold mb-2">みんなの絵本</h1>
      </header>
      <div className="relative flex justify-center">
        {/* 画像に透過を適用 */}
        <img
          src="/home/bookSherf1.png"
          alt="Book Shelf Bottom"
          className={`absolute top-[-20px] left-1/2 transform -translate-x-1/2 w-[824px] h-[824px] object-contain pointer-events-none max-w-none max-h-none transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
          style={{ zIndex: 7 }}
        />
        <img
          src="/home/bookSherf2.png"
          alt="Book Shelf Middle"
          className={`absolute top-[-20px] left-1/2 transform -translate-x-1/2 w-[824px] h-[824px] object-contain pointer-events-none max-w-none max-h-none transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
          style={{ zIndex: 5 }}
        />
        <img
          src="/home/bookSherf3.png"
          alt="Book Shelf Top"
          className={`absolute top-[-20px] left-1/2 transform -translate-x-1/2 w-[824px] h-[824px] object-contain pointer-events-none max-w-none max-h-none transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
          style={{ zIndex: 3 }}
        />
        <img
          src="/home/bookSherf4.png"
          alt="Book Shelf Highest"
          className={`absolute top-[-20px] left-1/2 transform -translate-x-1/2 w-[824px] h-[824px] object-contain pointer-events-none max-w-none max-h-none transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
          style={{ zIndex: 1 }}
        />

        {/* BookListPageを特定のレイヤーに挟む */}
        <div className="relative">
          <Suspense fallback={null}>
            <BookListPage rowStyles={rowStyles} />
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

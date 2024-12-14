import React, { Suspense } from 'react';
import BookListPage from './BookListPage';

export default function Page() {
  return (
    <div>
    <header className="w-full mt-8">
    <h1 className="text-center text-3xl font-bold">みんなの絵本</h1>
  </header>
    <div className="relative flex justify-center">
      <img
        src="/home/bookSherf.png"
        alt="Book Shelf"
        className="absolute left-1/2 transform -translate-x-1/2 w-[950px] h-[950px] object-contain pointer-events-none max-w-none max-h-none"
      />
      <div className="relative mt-[64px]">
        <Suspense fallback={<div>Loading...</div>}>
          <BookListPage />
        </Suspense>
      </div>
    </div>
    </div>
  );
}

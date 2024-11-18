'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// BookDetailPage を動的にインポート (SSR を無効化)
const BookDetailPage = dynamic(() => import('../../components/BookDetailPage'), { ssr: false });

export default function Page({ params }) {
  // params.bookId を取得
  const bookId = params?.bookId

  return <BookDetailPage bookId={bookId} />;
}

'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// BookDetailPage を動的にインポート
const BookDetailPage = dynamic(() => import('../../components/BookDetailPage'), { ssr: false });

export default function Page() {
  return <BookDetailPage />;
}

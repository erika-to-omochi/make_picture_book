import React from 'react';
import dynamic from 'next/dynamic';

// BookDetailPage を動的にインポート (SSR を無効化)
const BookDetailPage = dynamic(() => import('../../components/BookDetailPage'), { ssr: false });

// メタデータを生成する関数
export async function generateMetadata({ params }) {
  const bookId = params?.bookId;

  return {
    title: `Book ${bookId} - 絵本がぽんっ`,
    description: `Book ${bookId} の詳細情報`,
    openGraph: {
      title: `Book ${bookId}`,
      description: `Book ${bookId} の詳細情報`,
      images: [
        {
          url: `https://ehon-ga-pon.com/books/${bookId}-og-image.png`,
          width: 1200,
          height: 630,
          alt: `Book ${bookId} のOGP画像`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Book ${bookId}`,
      description: `Book ${bookId} の詳細情報`,
      image: `https://ehon-ga-pon.com/books/${bookId}-twitter-image.png`,
    },
  };
}

// ページコンポーネント
export default function Page({ params }) {
  const bookId = params?.bookId;

  return <BookDetailPage bookId={bookId} />;
}

import React from 'react';
import BookDetailPage from '../../components/BookDetailPage';

// サーバーサイドのメタデータ生成関数
export async function generateMetadata({ params }) {
  const bookId = params?.bookId;

  let ogpImageUrl = '';
  try {
    // バックエンドにOGP画像生成リクエストを送信
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/ogp?title=Book%20${bookId}&author=Author%20Name`);
    const data = await response.json();

    // 画像URLを生成
    ogpImageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${data.url}`;
  } catch (error) {
    console.error('OGP画像の生成中にエラーが発生しました:', error);
    ogpImageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/default-og-image.png`;
  }

  // 動的メタデータを返す
  return {
    title: `Book ${bookId} - 絵本がぽんっ`,
    description: `Book ${bookId} の詳細情報`,
    openGraph: {
      title: `Book ${bookId}`,
      description: `Book ${bookId} の詳細情報`,
      url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/books/${bookId}`, // ページのURL
      images: [
        {
          url: ogpImageUrl, // OGP画像のURL
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
      image: ogpImageUrl, // Twitterカードに表示する画像
    },
  };
}

// ページコンポーネント
export default function Page({ params }) {
  const bookId = params?.bookId;
  return <BookDetailPage bookId={bookId} />;
}

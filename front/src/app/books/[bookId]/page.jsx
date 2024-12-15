"use client"
import React, { useEffect, useState } from 'react';
import BookDetailPage from '../../components/BookDetailPage';

export default function Page({ params }) {
  const bookId = params?.bookId;
  const [ogpImageUrl, setOgpImageUrl] = useState('');
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    const fetchOgpImage = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/ogp?title=Book%20${bookId}&author=Author%20Name`);
        const data = await response.json();
        console.log('レスポンスデータ:', data);

        const ogpImage = `${baseUrl}${data.url}`;
        setOgpImageUrl(ogpImage);

        // 動的メタデータを生成
        setMetadata({
          title: `Book ${bookId} - 絵本がぽんっ`,
          description: `Book ${bookId} の詳細情報`,
          openGraph: {
            title: `Book ${bookId}`,
            description: `Book ${bookId} の詳細情報`,
            url: `${baseUrl}/books/${bookId}`, // ページのURL
            images: [
              {
                url: ogpImage,
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
            image: ogpImage,
          },
        });
      } catch (error) {
        console.error('OGP画像の取得中にエラーが発生しました:', error);
        setOgpImageUrl(`${process.env.NEXT_PUBLIC_API_BASE_URL}/default-og-image.png`);
      }
    };

    fetchOgpImage();
  }, [bookId]);

  if (!metadata) {
    return <div>Loading...</div>;
  }

  return (
    <BookDetailPage bookId={bookId} />
  );
}

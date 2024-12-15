"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head"; // Next.jsのヘッド管理コンポーネント
import BookDetailPage from "../../components/BookDetailPage";

export default function Page({ params }) {
  const bookId = params?.bookId;
  const [metadata, setMetadata] = useState(null);
  const [bookData, setBookData] = useState(null);

  // デフォルトOGP画像のURL
  const defaultOgpUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/default-og-image.png`;

  useEffect(() => {
    // 絵本データの取得
    const fetchBookData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/api/v1/books/${bookId}`);
        const data = await response.json();
        setBookData(data);
      } catch (error) {
        console.error("絵本データの取得中にエラーが発生しました:", error);
      }
    };

    if (bookId) {
      fetchBookData();
    }
  }, [bookId]);

  useEffect(() => {
    if (!bookData) {
      console.error("bookData is not available");
      return;
    }

    console.log("bookData:", bookData);
    console.log("Title:", bookData.title);
    console.log("Author:", bookData.author_name);

    const fetchOgpImage = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      try {
        // OGP画像のURLを取得
        const response = await fetch(
          `${baseUrl}/ogp?title=${encodeURIComponent(bookData.title)}&author=${encodeURIComponent(bookData.author_name)}`
        );
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch OGP image: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("OGP Image Data:", data);

        // 絶対URLを生成
        const ogpUrl = `${baseUrl}${data.url}`;

        // 動的メタデータの生成
        setMetadata({
          title: `${bookData.title} - 絵本がぽんっ`,
          description: `${bookData.title} の詳細情報`,
          openGraph: {
            title: bookData.title,
            description: `${bookData.title} の詳細情報`,
            url: `${baseUrl}/books/${bookId}`, // ページのURL
            images: [
              {
                url: ogpUrl,
                width: 1200,
                height: 630,
                alt: `${bookData.title} のOGP画像`,
              },
            ],
          },
          twitter: {
            card: "summary_large_image",
            title: bookData.title,
            description: `${bookData.title} の詳細情報`,
            image: ogpUrl,
          },
        });
      } catch (error) {
        console.error("OGP画像の取得中にエラーが発生しました:", error);

        // デフォルトのOGP画像を設定
        setMetadata({
          title: `${bookData.title} - 絵本がぽんっ`,
          description: `${bookData.title} の詳細情報`,
          openGraph: {
            title: bookData.title,
            description: `${bookData.title} の詳細情報`,
            url: `${baseUrl}/books/${bookId}`, // ページのURL
            images: [
              {
                url: defaultOgpUrl, // デフォルト画像を使用
                width: 1200,
                height: 630,
                alt: `${bookData.title} のOGP画像`,
              },
            ],
          },
          twitter: {
            card: "summary_large_image",
            title: bookData.title,
            description: `${bookData.title} の詳細情報`,
            image: defaultOgpUrl, // デフォルト画像を使用
          },
        });
      }
    };

    fetchOgpImage();
  }, [bookData, bookId, defaultOgpUrl]);

  if (!bookData || !metadata) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* メタタグの設定 */}
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta property="og:description" content={metadata.openGraph.description} />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={metadata.openGraph.images[0].alt} />
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta name="twitter:title" content={metadata.twitter.title} />
        <meta name="twitter:description" content={metadata.twitter.description} />
        <meta name="twitter:image" content={metadata.twitter.image} />
      </Head>

      {/* ページ内容 */}
      <BookDetailPage bookId={bookId} bookData={bookData} />
    </>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Head from 'next/head';
import BookDetailPage from "../../components/BookDetailPage";

export default function Page({ params }) {
  const bookId = params?.bookId;
  const [ogpImageUrl, setOgpImageUrl] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [bookData, setBookData] = useState(null);

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

    console.log("bookData:", bookData); // bookData の中身を確認
    console.log("Title:", bookData.title); // title が取得できているか確認
    console.log("Author:", bookData.author_name); // author が取得できているか確認

    const fetchOgpImage = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        // タイトルと著者名をエンコード
        const title = encodeURIComponent(bookData.title || "unknown");
        const author = encodeURIComponent(bookData.author_name || "anonymous");

        // OGP画像のURLを取得
        const response = await fetch(`${baseUrl}/ogp?title=${title}&author=${author}`);
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch OGP image: ${response.statusText}`);
        }

        const data = await response.json();

        // 取得したデータをログに出力
        console.log("OGP Image Data:", data);

        // 絶対URLを構築
        const absoluteOgpImageUrl = `${baseUrl}${data.url}`;
        setOgpImageUrl(absoluteOgpImageUrl);

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
                url: absoluteOgpImageUrl,
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
            image: absoluteOgpImageUrl,
          },
        });
      } catch (error) {
        console.error("Error fetching OGP image:", error);
      }
    };

    fetchOgpImage();
  }, [bookData, bookId]);

  if (!bookData || !metadata) {
    return <div>Loading...</div>;
  }

  return (
    <>
    <Head>
      {/* 必要に応じてデフォルトのメタタグを上書き */}
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <meta property="og:title" content={metadata.openGraph.title} />
      <meta property="og:description" content={metadata.openGraph.description} />
      <meta property="og:url" content={metadata.openGraph.url} />
      <meta property="og:image" content={metadata.openGraph.images[0].url} />
      <meta name="twitter:title" content={metadata.twitter.title} />
      <meta name="twitter:description" content={metadata.twitter.description} />
      <meta name="twitter:image" content={metadata.twitter.image} />
    </Head>
    <BookDetailPage bookId={bookId} bookData={bookData} />
  </>
  );
}

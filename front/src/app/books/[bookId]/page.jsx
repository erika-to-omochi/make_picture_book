import React from "react";
import BookDetailPage from "../../components/BookDetailPage";
import axios from "axios";

// Next.jsのmetadata生成用関数
export async function generateMetadata({ params }) {
  const { bookId } = params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // デフォルトOGP画像のURL
  const defaultOgpUrl = `${baseUrl}/default-og-image.png`;

  let bookData = null;
  let ogpUrl = defaultOgpUrl;

  try {
    // 絵本データの取得
    const bookResponse = await axios.get(`${baseUrl}/api/v1/books/${bookId}`);
    bookData = bookResponse.data;

    // OGP画像の取得
    try {
      const ogpResponse = await axios.get(`${baseUrl}/ogp`, {
        params: {
          title: bookData.title,
          author: bookData.author_name,
        },
      });

      if (ogpResponse.data && ogpResponse.data.url) {
        ogpUrl = `${baseUrl}${ogpResponse.data.url}`;
      }
    } catch (ogpError) {
      console.error("OGP画像の取得中にエラーが発生しました:", ogpError);
      // ogpUrlはデフォルトのまま
    }
  } catch (error) {
    console.error("絵本データの取得中にエラーが発生しました:", error);
    // 必要に応じて404ページを返す
    return {
      title: "絵本が見つかりません",
      description: "指定された絵本が見つかりませんでした。",
    };
  }

  return {
    title: `${bookData.title} - 絵本がぽんっ`,
    description: `${bookData.title} の詳細情報`,
    openGraph: {
      title: bookData.title,
      description: `${bookData.title} の詳細情報`,
      url: `${baseUrl}/books/${bookId}`,
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
      images: [ogpUrl],
    },
  };
}

export default async function Page({ params }) {
  const { bookId } = params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  let bookData = null;

  try {
    // 絵本データの取得
    const bookResponse = await axios.get(`${baseUrl}/api/v1/books/${bookId}`);
    bookData = bookResponse.data;
  } catch (error) {
    console.error("絵本データの取得中にエラーが発生しました:", error);
    // 必要に応じてエラーメッセージを表示
  }

  return (
    <BookDetailPage bookId={bookId} bookData={bookData} />
  );
}

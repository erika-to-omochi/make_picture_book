import React from "react";
import BookDetailPage from "../../components/BookDetailPage";
import axios from "axios";

// Next.jsのmetadata生成用関数
export async function generateMetadata({ params }) {
  const { bookId } = params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const defaultOgpUrl = `${baseUrl}/default-og-image.png`;

  try {
    const bookResponse = await axios.get(`${baseUrl}/api/v1/books/${bookId}`);
    const bookData = bookResponse.data;

    const ogpResponse = await axios.get(`${baseUrl}/ogp`, {
      params: { title: bookData.title, author: bookData.author_name },
    });

    const ogpUrl = ogpResponse.data?.url
      ? `${baseUrl}${ogpResponse.data.url}`
      : defaultOgpUrl;

    return {
      title: `${bookData.title} - 絵本がぽんっ`,
      description: `${bookData.title} を見にいく`,
      openGraph: {
        title: bookData.title,
        description: `${bookData.title} を見にいく`,
        url: `${baseUrl}/books/${bookId}`,
        images: [{ url: ogpUrl, width: 1200, height: 630, alt: `${bookData.title} のOGP画像` }],
      },
      twitter: {
        card: "summary_large_image",
        title: bookData.title,
        description: `${bookData.title} を見にいく`,
        images: [ogpUrl],
      },
    };
  } catch (error) {
    console.error("Metadata生成中にエラーが発生しました:", error);
    return {
      title: "絵本が見つかりません",
      description: "指定された絵本が見つかりませんでした。",
      openGraph: { images: [{ url: defaultOgpUrl, width: 1200, height: 630 }] },
    };
  }
}

export default function Page({ params }) {
  const { bookId } = params;
  return <BookDetailPage bookId={bookId} />;
}

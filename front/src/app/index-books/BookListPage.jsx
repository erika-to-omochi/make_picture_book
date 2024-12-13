'use client';

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useBooksStore from "@/stores/booksStore";
import BookList from "../components/BookList";
import Pagination from "../components/Pagination";

function BookListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");

  const perPage = 9;

  // ストアから必要なデータを取得
  const publishedBooks = useBooksStore((state) => state.publishedBooks);
  const pagination = useBooksStore((state) => state.pagination);
  const loading = useBooksStore((state) => state.loading);
  const error = useBooksStore((state) => state.error);
  const fetchPublishedBooks = useBooksStore((state) => state.fetchPublishedBooks);

  // URLの `page` パラメータが変更されたときにデータを取得
  useEffect(() => {
    const page = parseInt(pageParam, 9) || 1;
    fetchPublishedBooks(page, perPage);
  }, [fetchPublishedBooks, pageParam, perPage]);

  // ページ変更時のハンドラー
  const handlePageChange = (page) => {
    if (page) {
      router.push(`/index-books?page=${page}`);
    }
  };

  // ローディング状態
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="loading loading-dots loading-lg"></span>
          <p className="mt-4 text-lg font-semibold">ページを読み込んでいます...</p>
        </div>
      </div>
    );

  // エラー状態
  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">絵本の読み込み中にエラーが発生しました。</p>
      </div>
    );

  // コンテンツの表示
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 pb-32">
      <h1 className="text-3xl font-bold">みんなの絵本</h1>
      <BookList books={publishedBooks} pageType="bookListPage" />
      {/* Paginationコンポーネント */}
      <div className="mt-4">
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}

export default BookListPage;

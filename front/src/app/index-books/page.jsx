"use client";

import React, { useEffect } from "react";
import useBooksStore from '../../stores/booksStore';
import BookList from "../components/BookList";

function BookListPage() {
  const publishedBooks = useBooksStore(state => state.publishedBooks);
  const loading = useBooksStore(state => state.loading);
  const error = useBooksStore(state => state.error);
  const fetchPublishedBooks = useBooksStore(state => state.fetchPublishedBooks);

  useEffect(() => {
    fetchPublishedBooks();
  }, [fetchPublishedBooks]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="loading loading-dots loading-lg"></span>
          <p className="mt-4 text-lg font-semibold">ページを読み込んでいます...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">絵本の読み込み中にエラーが発生しました。</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8 pb-32">
      <h1 className="text-3xl font-bold mb-4">みんなの絵本</h1>
      <BookList books={publishedBooks} pageType="bookListPage" />
    </div>
  );
}

export default BookListPage;

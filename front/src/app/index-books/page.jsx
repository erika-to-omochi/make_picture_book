"use client";

import React from "react";
import useFetchBooks from "../hooks/useFetchBooks";
import BookList from "../components/BookList";

function BookListPage() {
  const { books, loading, error } = useFetchBooks();

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
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
    <div className="flex flex-col items-center justify-center p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">みんなの絵本</h1>
      <BookList books={books} />
    </div>
  );
}

export default BookListPage;

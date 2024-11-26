"use client";

import React from "react";
import useFetchBooks from "../hooks/useFetchBooks";
import BookList from "../components/BookList";

function BookListPage() {
  const { books, loading, error } = useFetchBooks();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading books.</p>;

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">みんなの絵本</h1>
      <BookList books={books} />
    </div>
  );
}

export default BookListPage;

"use client";

import React, { useEffect, useState } from "react";
import axios from "../../api/axios";

function BookListPage() {
  const [books, setBooks] = useState([]); // 絵本データを格納
  const [loading, setLoading] = useState(true); // ローディング状態

  useEffect(() => {
    // APIからデータを取得
    const fetchBooks = async () => {
      try {
        const response = await axios.get("/api/v1/books");
        const sortedBooks = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at) // 新しい順にソート
        );
        setBooks(sortedBooks);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching books:", error);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">みんなの絵本</h1>
      <div className="space-y-4">
        {books.map((book) => (
          <div
            key={book.id}
            className="flex items-center justify-between p-4 bg-white bg-opacity-50 rounded-lg shadow-md"
          >
            <div>
              <h2 className="text-xl font-semibold">{book.title}</h2>
              <p className="text-bodyText text-sm">作者: {book.author_name}</p>
            </div>
            <button
              onClick={() => window.location.href = `/books/${book.id}`}
              className="px-4 py-2 ml-4 bg-customButton text-white rounded-md hover:brightness-90"
            >
              読む
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookListPage;
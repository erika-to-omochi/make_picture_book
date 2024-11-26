"use client";

import React from "react";

function BookList({ books }) {
  return (
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
            onClick={() => (window.location.href = `/books/${book.id}`)}
            className="px-4 py-2 ml-4 bg-customButton text-white rounded-md hover:brightness-90"
          >
            読む
          </button>
        </div>
      ))}
    </div>
  );
}

export default BookList;
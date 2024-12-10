"use client";

import React from "react";
import PropTypes from 'prop-types';
import { FaLock, FaLockOpen, FaEdit, FaCheckCircle } from 'react-icons/fa';

function BookList({ books, pageType }) {
  return (
    <div className="space-y-4">
      {books.map((book) => {
        // 公開範囲とステータスの詳細を取得する関数
        const getVisibilityDetails = (book) => {
          if (pageType !== "myPage") {
            // BookListPageでは公開範囲を表示しない
            return null;
          }

          if (book.is_draft) {
            // 下書きの場合は「非公開」と表示
            return null;
          } else {
            // 下書きでない場合は公開範囲に基づく表示
            return {
              text: book.visibility === 0 ? "公開" : "非公開",
              className: book.visibility === 0 ? 'bg-gray-200 text-green-800' : 'bg-gray-200 text-red-800',
              icon: book.visibility === 0 ? <FaLockOpen className="mr-1" aria-label="公開" /> : <FaLock className="mr-1" aria-label="非公開" />,
            };
          }
        };

        const getStatusDetails = (book) => {
          if (pageType !== "myPage") {
            // BookListPageではステータスを表示しない
            return null;
          }

          return book.is_draft
            ? {
                text: "下書き",
                className: 'bg-gray-200 text-yellow-800',
                icon: <FaEdit className="mr-1" aria-label="下書き" />,
              }
            : {
                text: "完成",
                className: 'bg-gray-200 text-blue-800',
                icon: <FaCheckCircle className="mr-1" aria-label="完成" />,
              };
        };

        const visibility = getVisibilityDetails(book);
        const status = getStatusDetails(book);

        return (
          <div
            key={book.id}
            className="flex items-center justify-between p-4 bg-white bg-opacity-50 rounded-lg shadow-md"
          >
            <div>
              <h2 className="text-xl font-semibold">{book.title}</h2>
              <p className="text-bodyText text-sm">作者: {book.author_name}</p>
              <div className="flex space-x-2 mt-2">
                {/* 公開範囲の表示（MyPageのみ） */}
                {visibility && (
                  <span
                    className={`flex items-center px-2 py-1 text-xs font-semibold rounded ${visibility.className}`}
                    title={visibility.text}
                  >
                    {visibility.icon}
                    {visibility.text}
                  </span>
                )}
                {/* ステータスの表示（MyPageのみ） */}
                {status && (
                  <span
                    className={`flex items-center px-2 py-1 text-xs font-semibold rounded ${status.className}`}
                    title={status.text}
                  >
                    {status.icon}
                    {status.text}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => (window.location.href = `/books/${book.id}`)}
              className="px-4 py-2 ml-4 bg-customButton text-white rounded-md hover:brightness-90"
            >
              読む
            </button>
          </div>
        );
      })}
    </div>
  );
}

BookList.propTypes = {
  books: PropTypes.array.isRequired,
  pageType: PropTypes.oneOf(['myPage', 'bookListPage']).isRequired,
};

export default BookList;

"use client";

import React from "react";
import PropTypes from 'prop-types';
import { FaLock, FaLockOpen, FaEdit, FaCheckCircle } from 'react-icons/fa';

function BookList({ books, pageType }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => {
        // 公開範囲とステータスの詳細を取得する関数
        const getVisibilityDetails = (book) => {
          if (pageType !== "myPage") {
            return null;
          }

          if (book.is_draft) {
            return null;
          } else {
            return {
              text: book.visibility === 0 ? "公開" : "非公開",
              className: book.visibility === 0 ? 'bg-gray-200 text-green-800' : 'bg-gray-200 text-red-800',
              icon: book.visibility === 0 ? <FaLockOpen className="mr-1" aria-label="公開" /> : <FaLock className="mr-1" aria-label="非公開" />,
            };
          }
        };

        const getStatusDetails = (book) => {
          if (pageType !== "myPage") {
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
            onClick={() => (window.location.href = `/books/${book.id}`)}
            className="w-[192px] h-[216px] flex flex-col justify-between p-4 bg-white bg-opacity-50 rounded-lg shadow-md cursor-pointer transform transition-transform hover:translate-y-[-5px]"
          >
            <div className="text-center flex-grow">
              <h2 className="text-xl font-bold mt-4 overflow-hidden text-ellipsis whitespace-nowrap">{book.title}</h2>
              <img
                src="/home/ファビコン.png"
                alt="ファビコン"
                className="mx-auto my-4 w-16 h-16"
              />
            </div>
            <p className="text-bodyText text-sm mt-auto text-center">作者: {book.author_name}</p>
            <div className="flex space-x-2 mt-2 justify-center">
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

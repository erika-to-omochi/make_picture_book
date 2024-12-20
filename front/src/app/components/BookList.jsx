'use client';

import React from "react";
import PropTypes from "prop-types";
import { FaLock, FaLockOpen, FaEdit, FaCheckCircle, FaTrash } from "react-icons/fa";

function BookList({ books, pageType, isAuthor, handleEdit, handleDelete, rowStyles }) {
  const columnsPerRow = 3; // 1行あたりの列数
  return (
    <div className="grid gap-4 grid-cols-3 auto-rows-[216px]">
      {books.map((book, index) => {
        const rowIndex = Math.floor(index / columnsPerRow);
        const rowStyle = rowStyles[rowIndex % rowStyles.length] || {};

        const getVisibilityDetails = (book) => {
          if (pageType !== "myPage") {
            return null;
          }
          if (book.is_draft) {
            return null;
          } else {
            return {
              text: book.visibility === 0 ? "公開" : "非公開",
              className:
                book.visibility === 0
                  ? "bg-gray-200 text-green-800"
                  : "bg-gray-200 text-red-800",
              icon:
                book.visibility === 0 ? (
                  <FaLockOpen className="mr-1" aria-label="公開" />
                ) : (
                  <FaLock className="mr-1" aria-label="非公開" />
                ),
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
                className: "bg-gray-200 text-yellow-800",
                icon: <FaEdit className="mr-1" aria-label="下書き" />,
              }
            : {
                text: "完成",
                className: "bg-gray-200 text-blue-800",
                icon: <FaCheckCircle className="mr-1" aria-label="完成" />,
              };
        };

        const visibility = getVisibilityDetails(book);
        const status = getStatusDetails(book);

        return (
          <div
            key={book.id}
            onClick={() => (window.location.href = `/books/${book.id}`)}
            className="relative w-[192px] h-[216px] flex flex-col justify-between p-4 bg-customBackground rounded-lg shadow-md cursor-pointer transform transition-transform hover:translate-y-[-64px]"
            style={{ zIndex: rowStyle.zIndex }}
          >
            {/* 上部左側: ステータスと公開情報 */}
            <div className="absolute top-2 left-2 flex gap-2">
              {/* 公開範囲の表示 */}
              {visibility && (
                <span
                  className={`flex items-center px-2 py-1 text-xs font-semibold rounded ${visibility.className}`}
                  title={visibility.text}
                >
                  {visibility.icon}
                  {visibility.text}
                </span>
              )}
              {/* ステータスの表示 */}
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
            {/* 上部右側: 編集と削除ボタン */}
            {isAuthor && (
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(book.id);
                  }}
                  className="flex items-center justify-center"
                  title="編集する"
                >
                  <FaEdit className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(book.id);
                  }}
                  className="flex items-center justify-center"
                  title="削除する"
                >
                  <FaTrash className="text-red-600 hover:text-red-800 transition-colors duration-200" />
                </button>
              </div>
            )}
            <div className="text-center flex-grow">
              <h2 className="text-xl font-bold mt-4 overflow-hidden text-ellipsis whitespace-nowrap">
                {book.title}
              </h2>
            </div>
            <p className="text-bodyText text-sm mt-auto text-center">
              作者: {book.author_name}
            </p>
            <img
              src="/home/favicon.png"
              alt="ファビコン"
              className="mx-auto my-4 w-16 h-16"
            />
          </div>
        );
      })}
    </div>
  );
}

BookList.propTypes = {
  books: PropTypes.array.isRequired,
  pageType: PropTypes.oneOf(["myPage", "bookListPage"]).isRequired,
  isAuthor: PropTypes.bool.isRequired, // 作者かどうかの判定
  handleEdit: PropTypes.func.isRequired, // 編集ボタンのハンドラ
  handleDelete: PropTypes.func.isRequired, // 削除ボタンのハンドラ
  rowStyles: PropTypes.array, // 行ごとのスタイルを受け取るプロップ
};

export default BookList;

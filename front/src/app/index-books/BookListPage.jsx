'use client';

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useBooksStore from "@/stores/booksStore";
import BookList from "../components/BookList";
import Pagination from "../components/Pagination";
import PropTypes from "prop-types";
import { FaSearch, FaTimes } from "react-icons/fa";

function BookListPage({ rowStyles = [] }) {
  const router = useRouter();

  const perPage = 9;

  // ストアから必要なデータとアクションを取得
  const publishedBooks = useBooksStore((state) => state.publishedBooks);
  const pagination = useBooksStore((state) => state.pagination);
  const loading = useBooksStore((state) => state.loading);
  const error = useBooksStore((state) => state.error);
  const fetchPublishedBooks = useBooksStore((state) => state.fetchPublishedBooks);
  const searchBooks = useBooksStore((state) => state.searchBooks);
  const setSearchParams = useBooksStore((state) => state.setSearchParams);
  const resetSearch = useBooksStore((state) => state.resetSearch);
  const filteredBooks = useBooksStore((state) => state.filteredBooks);
  const isSearching = useBooksStore((state) => state.isSearching);

  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page") || "1";
  const tagsParam = searchParams.get("tags") || "";

  // URLの `page` パラメータが変更されたときにデータを取得
  useEffect(() => {
    const page = parseInt(pageParam, 10) || 1;
    fetchPublishedBooks(page, perPage, tagsParam);
  }, [fetchPublishedBooks, pageParam, perPage, tagsParam]);

  // ページ変更時のハンドラー
  const handlePageChange = (page) => {
    if (page) {
      router.push(`/index-books?page=${page}${tagsParam ? `&tags=${tagsParam}` : ""}`);
    }
  };

  const handleSearch = () => {
    searchBooks();
    // 必要に応じて URL を更新
    router.push(`/index-books?page=1${searchParams.tags ? `&tags=${searchParams.tags}` : ""}${searchParams.title ? `&title=${searchParams.title}` : ""}${searchParams.author ? `&author=${searchParams.author}` : ""}`);
  };

  const handleResetSearch = () => {
    resetSearch();
    // 必要に応じて URL をリセット
    router.push(`/index-books?page=1`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ [name]: value });
  };

  // エラー状態
  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">絵本の読み込み中にエラーが発生しました。</p>
      </div>
    );

  // ローディング状態
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">読み込み中...</p>
      </div>
    );
  }

  // コンテンツの表示
  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4 pb-32">
      {/* 検索フォーム */}
      <div className="mb-8 flex flex-row items-center gap-2 overflow-x-auto">
        {/* タグ検索 */}
        <div className="flex items-center flex-shrink-0">
          <input
            type="text"
            name="tags"
            value={searchParams.tags}
            onChange={handleInputChange}
            placeholder="タグで検索（カンマ区切り）"
            className="flex-grow min-w-[150px] p-2 border rounded-md"
          />
        </div>
        {/* タイトル検索 */}
        <div className="flex items-center flex-shrink-0">
          <input
            type="text"
            name="title"
            value={searchParams.title}
            onChange={handleInputChange}
            placeholder="タイトルで検索"
            className="flex-grow min-w-[150px] p-2 border rounded-md"
          />
        </div>
        {/* 作者名検索 */}
        <div className="flex items-center flex-shrink-0">
          <input
            type="text"
            name="author"
            value={searchParams.author}
            onChange={handleInputChange}
            placeholder="作者名で検索"
            className="flex-grow min-w-[150px] p-2 border rounded-md"
          />
        </div>
        {/* 検索ボタン */}
        <button
          onClick={handleSearch}
          className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80 flex-shrink-0"
          disabled={isSearching}
          aria-label="検索"
          title="検索"
        >
          <FaSearch className="w-5 h-5" />
        </button>
        {/* クリアボタンを常にレンダリングし、表示・非表示を制御 */}
        <button
          onClick={handleResetSearch}
          className={`p-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 flex-shrink-0 ${
            searchParams.tags || searchParams.title || searchParams.author ? "visible" : "invisible"
          }`}
          aria-label="クリア"
          title="クリア"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>

      <BookList
        books={isSearching ? filteredBooks : publishedBooks}
        pageType="bookListPage"
        rowStyles={rowStyles}
      />
      <div className="mt-4 z-10">
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}

// `rowStyles` をプロパティとして定義
BookListPage.propTypes = {
  rowStyles: PropTypes.array, // 列ごとのスタイルを受け取るためのプロップ
};

export default BookListPage;

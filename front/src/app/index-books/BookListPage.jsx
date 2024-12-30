'use client';

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useBooksStore from "@/stores/booksStore";
import BookList from "../components/BookList";
import Pagination from "../components/Pagination";
import PropTypes from "prop-types";
import axiosInstance from '@/api/axios';


function BookListPage({ rowStyles = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const [books, setBooks] = useState([]);
  const tagsQuery = searchParams.get("tags");
  const tagsParam = searchParams.get("tags");

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
    fetchPublishedBooks(page, perPage, tagsParam);
  }, [fetchPublishedBooks, pageParam, perPage, tagsParam]);

  // ページ変更時のハンドラー
  const handlePageChange = (page) => {
    if (page) {
      router.push(`/index-books?page=${page}${tagsParam ? `&tags=${tagsParam}` : ""}`);
    }
  };

  useEffect(() => {
    async function fetchFilteredBooks() {
      try {
        const response = await axiosInstance.get("/api/v1/books", {
          params: {
            tags: tagsQuery,
            page: 1,
            per_page: 9,
          },
        });
        setBooks(response.data);
      } catch (error) {
        console.error("書籍の取得に失敗しました:", error);
      }
    }

    async function fetchAllBooks() {
      try {
        const response = await axiosInstance.get("/api/v1/books", {
          params: {
            page: 1,
            per_page: 9,
          },
        });
        setBooks(response.data);
      } catch (error) {
        console.error("書籍の取得に失敗しました:", error);
      }
    }

    if (tagsQuery) {
      fetchFilteredBooks();
    } else {
      fetchAllBooks();
    }
  }, [tagsQuery]);


  // エラー状態
  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">絵本の読み込み中にエラーが発生しました。</p>
      </div>
    );

  // コンテンツの表示
  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4 pb-32">
      <BookList
        books={publishedBooks}
        pageType="bookListPage"
        rowStyles={rowStyles}
      />
      <div className="mt-4">
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

'use client';

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useBooksStore from '../../stores/booksStore';
import useAuthStore from '../../stores/authStore';
import BookList from "../components/BookList";
import Pagination from "../components/Pagination";

function MyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");

  const initialPage = parseInt(pageParam, 9) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const perPage = 9;

  const userName = useAuthStore(state => state.userName);
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const setUserName = useAuthStore(state => state.setUserName);
  const pagination = useBooksStore((state) => state.pagination);
  const myBooks = useBooksStore(state => state.myBooks);
  const loading = useBooksStore(state => state.loading);
  const error = useBooksStore(state => state.error);
  const fetchMyBooks = useBooksStore(state => state.fetchMyBooks);

  // クライアントサイドで userName を初期化
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, [setUserName]);

  // currentPage または isLoggedIn が変更されたときにデータをフェッチ
  useEffect(() => {
    if (isLoggedIn) {
      fetchMyBooks(currentPage, perPage);
    }
  }, [fetchMyBooks, isLoggedIn, currentPage, perPage]);

  // URLのクエリパラメータが変更されたときに currentPage を更新
  useEffect(() => {
    if (pageParam) {
      const newPage = parseInt(pageParam, 9);
      if (!isNaN(newPage) && newPage !== currentPage) {
        setCurrentPage(newPage);
      }
    }
  }, [pageParam, currentPage]);

  const handlePageChange = (page) => {
    if (page) {
      setCurrentPage(page);
      router.push(`/myPage?page=${page}`);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">ログインしてください。</p>
      </div>
    );
  }

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
    <div className="flex flex-col items-center justify-center p-8 space-y-6 pb-32">
      <h1 className="text-3xl font-bold">{userName}さんの絵本</h1>
      <BookList books={myBooks} pageType="myPage" />
      {/* Paginationコンポーネント */}
      <div className="mt-4">
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}

export default MyPage;

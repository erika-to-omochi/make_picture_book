'use client';

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useBooksStore from '../../stores/booksStore';
import useAuthStore from '../../stores/authStore';
import BookList from "../components/BookList";
import Pagination from "../components/Pagination";
import axiosInstance from '../../api/axios';

function MyPage({ rowStyles = [] }) {
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

  const handleEdit = (bookId) => {
    console.log(`Editing book with ID: ${bookId}`);
    router.push(`/books/${bookId}/edit`); // 編集ページに遷移
  };

  const handleDelete = async (bookId) => {
    const confirmDelete = window.confirm("この絵本を削除しますか？");
    if (!confirmDelete) return;
    try {
      await axiosInstance.delete(`/api/v1/books/${bookId}`);
      alert("絵本を削除しました。");
      fetchMyBooks(currentPage, perPage); // リストを更新
    } catch (error) {
      console.error("絵本の削除に失敗しました:", error);
      alert("絵本の削除中にエラーが発生しました。");
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
    <div className="flex flex-col items-center justify-center p-4 space-y-4 pb-32">
      <BookList
        books={myBooks}
        pageType="myPage"
        isAuthor={true}
        handleEdit={handleEdit} // 編集ハンドラを渡す
        handleDelete={handleDelete} // 削除ハンドラを渡す
        rowStyles={rowStyles}
      />
      {/* Paginationコンポーネント */}
      <div className="mt-4">
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}

export default MyPage;

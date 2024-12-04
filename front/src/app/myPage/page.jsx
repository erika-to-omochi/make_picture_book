'use client';

import React, { useEffect } from "react";
import useBooksStore from '../../stores/booksStore';
import useAuthStore from '../../stores/authStore';
import BookList from "../components/BookList";

function MyPage() {
  const userName = useAuthStore(state => state.userName);
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const logout = useAuthStore(state => state.logout);
  const loginMessage = useAuthStore(state => state.loginMessage);
  const setUserName = useAuthStore(state => state.setUserName);

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

  useEffect(() => {
    if (isLoggedIn) {
      fetchMyBooks();
    }
  }, [fetchMyBooks, isLoggedIn]);

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
    <div className="flex flex-col items-center justify-center p-8 space-y-8 pb-32">
      <h1 className="text-3xl font-bold mb-4">{userName}さんの絵本</h1>
      <BookList books={myBooks} pageType="myPage" />
    </div>
  );
}

export default MyPage;

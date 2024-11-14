// src/app/create-book/layout.js
"use client";

import CreateBookFooter from '../components/CreateBookFooter'; // CreateBookFooterのインポート

export default function CreateBookLayout({ children }) {
  // create-book ページ専用の状態管理を行いたい場合は、ここで管理するか、
  // ページコンポーネントからプロパティとして渡します。
  // ここではページコンポーネントで管理するため、フッターのレンダリングはページ側で行います。

  return (
    <>
      {children}
      {/* CreateBookFooter をここでレンダリングしない */}
      {/* ページコンポーネントで CreateBookFooter をレンダリングします */}
    </>
  );
}

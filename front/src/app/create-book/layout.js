"use client";

import CreateBookFooter from '../components/CreateBookFooter';

export default function CreateBookLayout({ children }) {
  return (
    <>
      {children}
      {/* CreateBookFooter をここでレンダリングしない */}
      {/* ページコンポーネントで CreateBookFooter をレンダリング */}
    </>
  );
}
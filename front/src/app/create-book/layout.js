"use client";

export default function CreateBookLayout({ children }) {
  return (
    <>
      {children}
      {/* CreateBookFooter をここでレンダリングしない */}
      {/* ページコンポーネントで CreateBookFooter をレンダリング */}
    </>
  );
}

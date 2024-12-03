// front/src/app/components/Sidebar.jsx

"use client";

import React from "react";

export default function Sidebar({ children }) {
  return (
    <div
      className="fixed top-16 left-0 h-full bg-white shadow-lg p-4 opacity-70"
      style={{ zIndex: 40 }} // 必要に応じて調整
    >
      {/* サイドバーのコンテンツ */}
      <div className="flex flex-col items-center gap-4">
        {children}
      </div>
    </div>
  );
}


"use client";

import React, { forwardRef } from "react";

// Sidebar コンポーネントを forwardRef でラップ
const Sidebar = forwardRef(({ children }, ref) => {
  return (
    <div
      ref={ref} // ref をここに渡す
      className="fixed top-16 left-0 h-full bg-white shadow-lg p-4 opacity-80 sidebar"
      style={{ zIndex: 40 }}
    >
      {/* サイドバーのコンテンツ */}
      <div className="flex flex-col items-center gap-4 mt-8">
        {children}
      </div>
    </div>
  );
});

// displayName を設定して ESLint エラーを解消
Sidebar.displayName = "Sidebar";

export default Sidebar;

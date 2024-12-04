"use client";

import React, { forwardRef } from "react";

const Sidebar = forwardRef(({ children }, ref) => {
  return (
    <div
      ref={ref} // ref をここに渡す
      className="fixed top-16 left-0 h-full bg-white shadow-lg p-4 opacity-70 sidebar"
      style={{ zIndex: 40 }}
    >
      {/* サイドバーのコンテンツ */}
      <div className="flex flex-col items-center gap-4">
        {children}
      </div>
    </div>
  );
});

export default Sidebar;

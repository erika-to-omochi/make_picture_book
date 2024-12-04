"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import useCanvasStore from "../../../../stores/canvasStore";
import CreateBookFooter from "@/app/components/CreateBookFooter";
import useIsMobile from "@/hooks/useIsMobile";

const Canvas = dynamic(() => import("../../../components/Canvas"), { ssr: false });

function EditBookPage() {
  const { bookId } = useParams();
  const isMobile = useIsMobile();

  const {
    setBackgroundColor,
    bookData,
    currentPageIndex,
    updateImage,
    deleteImage,
    pages,
    fetchBookData,
  } = useCanvasStore();

  // ローカル状態
  const [activePanel, setActivePanel] = useState(null); // パネルの状態

    // 書籍データの取得
    useEffect(() => {
      if (bookId) {
        fetchBookData(bookId);
      }
    }, [bookId, fetchBookData]);

  // パネルの切り替え
  const togglePanel = (panelName) => {
    setActivePanel((prev) => (prev === panelName ? null : panelName));
  };

  if (loading)
  return (
    <div className="flex items-center justify-center min-h-screen">
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
    <div className={`flex flex-col overflow-y-auto ${isMobile ? 'items-center' : 'items-end'}`}>
      {/* キャンバス */}
      <div className={`max-w-none ${isMobile ? 'mx-auto' : 'mr-10'}`}>
        {pages.length > 0 && pages[currentPageIndex] && (
          <Canvas
            pageElements={pages[currentPageIndex].pageElements}
            pageData={pages[currentPageIndex]}
            backgroundColor={pages[currentPageIndex]?.backgroundColor || "#ffffff"}
            onUpdateImage={updateImage}
            onDeleteImage={deleteImage}
            onSelectText={(index) => {
              useCanvasStore.getState().setSelectedTextIndex(index);
            }}
            showActionButtons={true}
            allowAddPage={true}
            showUndoButton={true}
          />
        )}
      </div>

      {/* フッター */}
      <CreateBookFooter
        activePanel={activePanel}
        togglePanel={togglePanel}
        setBackgroundColor={setBackgroundColor}
      />
    </div>
  );
}

export default EditBookPage;

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import axios from "../../../../api/axios";
import useCanvasStore from "../../../../stores/canvasStore";
import CreateBookFooter from "@/app/components/CreateBookFooter";

const Canvas = dynamic(() => import("../../../components/Canvas"), { ssr: false });

function EditBookPage() {
  const { bookId } = useParams();

  // Zustandストアから状態とアクションを取得
  const {
    bookData,
    setBookData,
    currentPageIndex,
    updateImage,
    deleteImage,
    deleteText,
    pages,
    setPages,
    addText,
    addImage,
    setBackgroundColor,
    selectedTextIndex,
  } = useCanvasStore();

  // ローカル状態
  const [activePanel, setActivePanel] = useState(null); // パネルの状態

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const response = await axios.get(`/api/v1/books/${bookId}/`);
        const formattedPages = response.data.pages.map((page) => {
          const content = {
            texts: [],
            images: [],
            backgroundColor: page.background_color || '#ffffff',
          };
          if (page.page_elements && Array.isArray(page.page_elements)) {
            page.page_elements.forEach((element) => {
              if (element.element_type === "text") {
                const { text, font_size, font_color, position_x, position_y } = element.content;
                content.texts.push({
                  text,
                  fontSize: font_size,
                  color: font_color,
                  x: position_x,
                  y: position_y,
                });
              } else if (element.element_type === "image") {
                const { src, width, height, position_x, position_y } = element.content;
                content.images.push({
                  src,
                  width,
                  height,
                  x: position_x,
                  y: position_y,
                });
              }
            });
          }
          return {
            page_number: page.page_number,
            content,
            book_id: page.book_id || 1,
          };
        });
        setBookData(response.data);
        setPages(formattedPages);
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };
    fetchBookData();
  }, [bookId]);

  useEffect(() => {
    if (pages.length > 0 && currentPageIndex >= 0 && currentPageIndex < pages.length) {
      const currentPage = pages[currentPageIndex];
      if (currentPage?.content?.images) {
        console.log("Loaded Images:", currentPage.content.images);
      } else {
        console.error("currentPage does not have images");
      }
    } else {
      console.error("Invalid pages array or currentPageIndex");
    }
  }, [pages, currentPageIndex]);

  // パネルの切り替え
  const togglePanel = (panelName) => {
    setActivePanel((prev) => (prev === panelName ? null : panelName));
  };

  const handleAddText = (newText) => {
    addText(newText); // ストアのaddTextアクションを呼び出す
  };

  // テキストの削除
  const handleDeleteText = (index) => {
    deleteText(index);
    setSelectedTextIndex(null);
  };

  if (!bookData) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* タイトルと著者 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{bookData.title}</h1>
        <p className="text-lg text-bodyText">作者: {bookData.author_name}</p>
      </div>

      {/* キャンバス */}
      {pages.length > 0 && pages[currentPageIndex]?.content?.texts && (
        <Canvas
          texts={pages[currentPageIndex].content.texts}
          images={pages[currentPageIndex].content.images}
          pageData={pages[currentPageIndex]}
          backgroundColor={pages[currentPageIndex]?.content?.backgroundColor || "#ffffff"}
          onDeleteImage={deleteImage}
          onDeleteText={deleteText}
          onSelectText={(index) => {
            useCanvasStore.getState().setSelectedTextIndex(index);
          }}
          showActionButtons={true}
        />
      )}

      {/* フッター */}
      <CreateBookFooter
        activePanel={activePanel}
        togglePanel={togglePanel}
        handleAddText={handleAddText}
        handleDeleteText={handleDeleteText}
        setBackgroundColor={setBackgroundColor}
      />
    </div>
  );
}

export default EditBookPage;

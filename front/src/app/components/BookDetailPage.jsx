"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import axios from '../../api/axios';
import { FaRegCommentDots, FaPrint, FaEdit, FaTrash } from 'react-icons/fa';
import useCanvasStore from '../../stores/canvasStore';

const Canvas = dynamic(() => import("./Canvas"), { ssr: false });

function BookDetailPage() {
  const { bookId } = useParams();

  // Zustandストアから状態とアクションを取得
  const {
    bookData,
    setBookData,
    currentPageIndex,
    setCurrentPageIndex,
    fetchBookData,
    updateImage,
    deleteImage,
    updateText,
    deleteText,
    pages,
    setPages,
    addImage,
  } = useCanvasStore();

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const response = await axios.get(`/api/v1/books/${bookId}/`);
        console.log("Book data:", response.data);
        if (response.data) {
          console.log("Pages:", response.data.pages); // ページデータのログ出力
          setBookData(response.data); // 書籍データを直接設定
          setPages(response.data.pages || []); // ページデータを Zustand ストアに保存
        } else {
          console.error("Invalid response format: No data found");
        }
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
        // Zustand の addImage を使用
        currentPage.content.images.forEach((img) => {
          addImage(img.src);
        });
      } else {
        console.error("currentPage does not have images");
      }
    } else {
      console.error("Invalid pages array or currentPageIndex");
    }
  }, [pages, currentPageIndex, addImage]);

  const handleComment = () => {
    console.log('コメントボタンがクリックされました');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    console.log('編集ボタンがクリックされました');
  };

  const handleDelete = () => {
    console.log('削除ボタンがクリックされました');
  };

  if (!bookData) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8">
      {/* タイトルと著者 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{bookData.title}</h1>
        <p className="text-lg text-bodyText">作者: {bookData.author_name}</p>
      </div>

      {/* キャンバス */}
      {pages.length > 0 && (
        <Canvas
          texts={pages[currentPageIndex].content.texts}
          images={pages[currentPageIndex].content.images}
          pageData={pages[currentPageIndex]}
          backgroundColor="#ffffff"
          onUpdateText={updateText}
          onUpdateImage={updateImage}
          onDeleteImage={deleteImage}
          onDeleteText={deleteText}
          onSelectText={(index) => {
            // 既存のcanvasStoreを使用して選択テキストを設定
            useCanvasStore.getState().setSelectedTextIndex(index);
          }}
        />
      )}

      {/* ページ切り替えボタン */}
      <div className="flex justify-center space-x-4">
        {pages.map((_, index) => (
          <button
            key={`page-btn-${index}`}
            onClick={() => setCurrentPageIndex(index)}
            className={`px-4 py-2 border rounded-md transition ${
              currentPageIndex === index
                ? "bg-bodyText text-white"
                : "bg-white border-gray-300"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* アイコンボタン */}
      <div className="flex space-x-6">
        <button
          onClick={handleComment}
          className="flex flex-col items-center justify-center p-4 border border-bodyText rounded-md text-bodyText hover:bg-gray-100 transition"
        >
          <FaRegCommentDots className="text-bodyText" size={32} />
          <span className="text-sm mt-2">コメント</span>
        </button>
        <button
          onClick={handlePrint}
          className="flex flex-col items-center justify-center p-4 border border-bodyText rounded-md text-bodyText hover:bg-gray-100 transition"
        >
          <FaPrint className="text-bodyText" size={32} />
          <span className="text-sm mt-2">印刷する</span>
        </button>
        <button
          onClick={handleEdit}
          className="flex flex-col items-center justify-center p-4 border border-bodyText rounded-md text-bodyText hover:bg-gray-100 transition"
        >
          <FaEdit className="text-bodyText" size={32} />
          <span className="text-sm mt-2">編集する</span>
        </button>
        <button
          onClick={handleDelete}
          className="flex flex-col items-center justify-center p-4 border border-bodyText rounded-md text-bodyText hover:bg-gray-100 transition"
        >
          <FaTrash className="text-bodyText" size={32} />
          <span className="text-sm mt-2">削除する</span>
        </button>
      </div>
    </div>
  );
}

export default BookDetailPage;

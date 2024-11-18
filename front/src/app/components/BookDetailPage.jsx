"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { FaRegCommentDots, FaPrint, FaEdit, FaTrash } from 'react-icons/fa';
import useBookDetailStore from '../../stores/bookDetailStore'; // 新しいストアをインポート
import useCanvasStore from '../../stores/canvasStore'; // 既存のcanvasStoreも使用

const Canvas = dynamic(() => import("./Canvas"), { ssr: false });

function BookDetailPage() {
  const { bookId } = useParams();

  // Zustandストアから状態とアクションを取得
  const {
    bookData,
    setBookData,
    selectedPageIndex,
    setSelectedPageIndex,
    fetchBookData,
  } = useBookDetailStore();

  const {
    images,
    setImages,
    texts,
    setTexts,
    updateImage,
    deleteImage,
    updateText,
    deleteText,
  } = useBookDetailStore();

  // bookDataをフェッチ
  useEffect(() => {
    if (bookId && !bookData) {
      fetchBookData(bookId);
    }
  }, [bookId, bookData, fetchBookData]);

  // bookDataが更新されたらimagesとtextsを設定
  useEffect(() => {
    if (bookData) {
      const currentPage = bookData.pages[selectedPageIndex];
      const loadedImages = currentPage.page_elements
        .filter((el) => el.element_type === "image")
        .map((el) => el.content);
      const loadedTexts = currentPage.page_elements
        .filter((el) => el.element_type === "text")
        .map((el) => el.content);
      setImages(loadedImages);
      setTexts(loadedTexts);
    }
  }, [bookData, selectedPageIndex, setImages, setTexts]);

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
      {bookData.pages.length > 0 && (
        <Canvas
          texts={texts}
          images={images}
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
        {bookData.pages.map((_, index) => (
          <button
            key={`page-btn-${index}`}
            onClick={() => setSelectedPageIndex(index)}
            className={`px-4 py-2 border rounded-md transition ${
              selectedPageIndex === index
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

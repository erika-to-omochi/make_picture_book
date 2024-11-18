"use client";

import axios from '../../api/axios';
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { FaRegCommentDots, FaPrint, FaEdit, FaTrash } from 'react-icons/fa';

const Canvas = dynamic(() => import("./Canvas"), { ssr: false });

function BookDetailPage({ initialBookData }) {
  const { bookId } = useParams();
  const [bookData, setBookData] = useState(initialBookData);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [images, setImages] = useState([]); // images の状態管理
  const [texts, setTexts] = useState([]); // texts の状態管理
  const backgroundColor = '#fff';

  useEffect(() => {
    if (!bookId || bookData) return;

    const fetchBookData = async () => {
      try {
        const response = await axios.get(`/api/v1/books/${bookId}`);
        setBookData(response.data);
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };

    fetchBookData();
  }, [bookId, bookData]);

  const handleUpdateImage = (index, updatedProperties) => {
    setImages((prevImages) =>
      prevImages.map((img, i) =>
        i === index ? { ...img, ...updatedProperties } : img
      )
    );
  };

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
          texts={bookData.pages[selectedPageIndex].page_elements.filter(
            (el) => el.element_type === "text"
          ).map((el) => el.content)}
          images={bookData.pages[selectedPageIndex].page_elements.filter(
            (el) => el.element_type === "image"
          ).map((el) => el.content)}
          backgroundColor="#ffffff"
          onUpdateImage={handleUpdateImage}
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

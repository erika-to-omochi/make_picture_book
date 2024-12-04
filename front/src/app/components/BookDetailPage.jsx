"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import axiosInstance from '../../api/axios';
import { FaRegCommentDots, FaPrint, FaEdit, FaTrash } from 'react-icons/fa';
import useCanvasStore from '../../stores/canvasStore';
import useIsMobile from "@/hooks/useIsMobile";

const Canvas = dynamic(() => import("./Canvas"), { ssr: false });

function BookDetailPage() {
  const { bookId } = useParams();
  const router = useRouter();
  const isMobile = useIsMobile();

  // Zustandストアから状態とアクションを取得
  const {
    bookData,
    currentPageIndex,
    pages,
    fetchBookData,
  } = useCanvasStore();

  // 作者判定の状態管理
  const [isAuthor, setIsAuthor] = useState(false);

  // 書籍データの取得
  useEffect(() => {
    if (bookId) {
      fetchBookData(bookId).then(() => {});
    }
  }, [bookId, fetchBookData]);

  // 作者判定APIを呼び出し
  useEffect(() => {
    const checkAuthorStatus = async () => {
      try {
        const response = await axiosInstance.get(`/api/v1/books/${bookId}/author_status`);
        setIsAuthor(response.data.is_author); // 作者かどうかを状態に設定
      } catch (error) {
        console.error("Error checking author status:", error);
      }
    };
    checkAuthorStatus();
  }, [bookId]);

  const handleComment = () => {
    console.log('コメントボタンがクリックされました');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    router.push(`/books/${bookId}/edit`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("この絵本を削除しますか？");
    if (!confirmDelete) return;
    try {
      await axiosInstance.delete(`/api/v1/books/${bookId}`);
      alert("絵本を削除しました。");
      router.push("/index-books"); // 削除後にリスト画面にリダイレクト
    } catch (error) {
      console.error("絵本の削除に失敗しました:", error);
      alert("絵本の削除中にエラーが発生しました。");
    }
  };

  if (!bookData) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* メインコンテナ: モバイルはflex-col, デスクトップはflex-row */}
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-center space-y-4 ${!isMobile ? 'space-y-0 space-x-6' : ''} w-full max-w-5xl`}>
        {/* キャンバスコンテナ */}
        {pages.length > 0 && pages[currentPageIndex] && (
          <div className="flex-shrink-0">
            <Canvas
              showActionButtons={false}
              isReadOnly={true}
              allowAddPage={false}
              showUndoButton={false}
            />
          </div>
        )}

        {/* アイコンボタンコンテナ: モバイルはflex-row, デスクトップはflex-col */}
        <div className={`flex ${isMobile ? 'flex-row' : 'flex-col'} ${isMobile ? 'space-x-6' : 'space-y-4'}`}>
          <button
            onClick={handleComment}
            className="flex flex-col items-center justify-center p-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition w-16 h-16"
          >
            <FaRegCommentDots className="text-gray-700" size={24} />
            <span style={{ fontSize: '0.6rem' }} className="mt-1">コメント</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex flex-col items-center justify-center p-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition w-16 h-16"
          >
            <FaPrint className="text-gray-700" size={24} />
            <span style={{ fontSize: '0.6rem' }} className="mt-1">印刷する</span>
          </button>
          {isAuthor && (
            <>
              <button
                onClick={handleEdit}
                className="flex flex-col items-center justify-center p-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition w-16 h-16"
              >
                <FaEdit className="text-gray-700" size={24} />
                <span style={{ fontSize: '0.6rem' }} className="mt-1">編集する</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex flex-col items-center justify-center p-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition w-16 h-16"
              >
                <FaTrash className="text-gray-700" size={24} />
                <span style={{ fontSize: '0.6rem' }} className="mt-1">削除する</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;

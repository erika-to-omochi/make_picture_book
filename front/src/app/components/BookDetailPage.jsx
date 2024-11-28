"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import axiosInstance from '../../api/axios';
import { FaRegCommentDots, FaPrint, FaEdit, FaTrash } from 'react-icons/fa';
import useCanvasStore from '../../stores/canvasStore';

const Canvas = dynamic(() => import("./Canvas"), { ssr: false });

function BookDetailPage() {
  const { bookId } = useParams();
  const router = useRouter();

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
      fetchBookData(bookId).then(() => {
        console.log("Fetched pages:", pages);
      });
    }
  }, [bookId, fetchBookData]); // pagesを依存配列から除外

  // pagesが更新されたときにログを出力
  useEffect(() => {
    console.log("Updated pages:", pages);
  }, [pages]);

  if (!bookId) {
    return <div>Loading...</div>;
  }

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
    <div className="flex flex-col items-center justify-center p-8 space-y-8">
      {/* タイトルと著者 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{bookData.title}</h1>
        <p className="text-lg text-bodyText">作者: {bookData.author_name}</p>
      </div>

      {/* キャンバス */}
      {pages.length > 0 && pages[currentPageIndex] && (
        <Canvas
          showActionButtons={false}
          isReadOnly={true}
        />
      )}

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
        {isAuthor && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

export default BookDetailPage;

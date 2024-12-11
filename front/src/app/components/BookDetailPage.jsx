"use client";

import React, { useEffect, useState, useRef } from "react";
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

  // コメント投稿セクションへの参照を作成
  const commentSectionRef = useRef(null);

  // Zustandストアから状態とアクションを取得
  const {
    bookData,
    currentPageIndex,
    pages,
    fetchBookData,
  } = useCanvasStore();

  // 作者判定の状態管理
  const [isAuthor, setIsAuthor] = useState(false);

    // コメントの内容を管理する状態
    const [comment, setComment] = useState("");

    // コメントリストを管理する状態
    const [comments, setComments] = useState([]);

  // 書籍データの取得
  useEffect(() => {
    if (bookId) {
      fetchBookData(bookId).then(() => {});
      fetchComments(); // コメントリストの取得を追加
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

  const fetchComments = async () => {
    try {
      const response = await axiosInstance.get(`/api/v1/books/${bookId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error("コメントの取得に失敗しました", error);
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("コメントを入力してください。");
      return;
    }
    try {
      await axiosInstance.post(`/api/v1/books/${bookId}/comments`, { content: comment });
      alert("コメントを投稿しました。");
      setComment("");
      fetchComments(); // コメントリストを再取得
    } catch (error) {
      console.error("コメントの投稿に失敗しました:", error);
      alert("コメントの投稿中にエラーが発生しました。");
    }
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
      router.push("/myPage"); // 削除後にリスト画面にリダイレクト
    } catch (error) {
      console.error("絵本の削除に失敗しました:", error);
      alert("絵本の削除中にエラーが発生しました。");
    }
  };

  // コメントアイコンをクリックしたときにコメントセクションにスクロール
  const scrollToComments = () => {
    if (commentSectionRef.current) {
      commentSectionRef.current.scrollIntoView({ behavior: 'smooth' });
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
              allowAddText={false}
            />
          </div>
        )}

        {/* アイコンボタンコンテナ: モバイルはflex-row, デスクトップはflex-col */}
        <div className={`flex ${isMobile ? 'flex-row' : 'flex-col'} ${isMobile ? 'space-x-6' : 'space-y-4'}`}>
          <button
            onClick={scrollToComments}
            aria-label="コメントを表示するボタン"
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
      {/* コメント投稿セクションとコメント一覧を中央揃えにする */}
      <div ref={commentSectionRef} className="w-full max-w-4xl mx-auto mt-8 p-4 border-t border-gray-300">
        <h2 className="text-bodyText font-semibold mb-4 text-gray-800">コメントを投稿する</h2>
        <form onSubmit={handleCommentSubmit} className="flex flex-col space-y-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="コメントを入力してください..."
            className="w-full mx-auto p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2"
            rows={4}
            required
          />
          <button
            type="submit"
            aria-label="コメントを投稿する"
            className="w-32 h-10 bg-customButton text-white rounded-md hover:bg-opacity-80 flex items-center justify-center mx-auto"
          >
            投稿する
          </button>
        </form>

        {/* コメントリストの表示 */}
        <div className="mt-8 mb-28">
          <h3 className="text-bodyText font-semibold mb-4 text-gray-800">コメント一覧</h3>
          {comments.length === 0 ? (
            <p className="text-gray-500">まだコメントがありません。</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((cmt) => (
                <li key={cmt.id} className="p-4 bg-white/50 rounded-md">
                  <div className="flex justify-between items-center text-xs text-bodyText text-gray-500 mb-2">
                    <span>{cmt.user.name}さんからのコメント</span>
                    <span>{new Date(cmt.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-bodyText text-gray-800">{cmt.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;

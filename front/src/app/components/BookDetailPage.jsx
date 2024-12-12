"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import axiosInstance from '../../api/axios';
import { FaRegCommentDots, FaPrint, FaEdit, FaTrash } from 'react-icons/fa';
import useCanvasStore from '../../stores/canvasStore';
import useIsMobile from "@/hooks/useIsMobile";
import useAuthStore from '../../stores/authStore';


const Canvas = dynamic(() => import("./Canvas"), { ssr: false });

function BookDetailPage() {
  const { bookId } = useParams();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { userName } = useAuthStore(); // ログイン中のユーザー名取得

  const commentSectionRef = useRef(null);

  const {
    bookData,
    currentPageIndex,
    pages,
    fetchBookData,
  } = useCanvasStore();

  const [isAuthor, setIsAuthor] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (bookId) {
      fetchBookData(bookId).then(() => {});
      fetchComments();
    }
  }, [bookId, fetchBookData]);

  useEffect(() => {
    const checkAuthorStatus = async () => {
      try {
        const response = await axiosInstance.get(`/api/v1/books/${bookId}/author_status`);
        setIsAuthor(response.data.is_author);
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
      fetchComments();
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
      router.push("/myPage");
    } catch (error) {
      console.error("絵本の削除に失敗しました:", error);
      alert("絵本の削除中にエラーが発生しました。");
    }
  };

  const scrollToComments = () => {
    if (commentSectionRef.current) {
      commentSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCommentDelete = async (commentId) => {
    const confirmDelete = window.confirm("このコメントを削除しますか？");
    if (!confirmDelete) return;
    try {
      await axiosInstance.delete(`/api/v1/books/${bookId}/comments/${commentId}`);
      alert("コメントを削除しました。");
      fetchComments();
    } catch (error) {
      console.error("コメントの削除に失敗しました:", error);
      alert("コメントの削除中にエラーが発生しました。");
    }
  };

  const handleCommentEdit = (comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) {
      alert("コメントを入力してください。");
      return;
    }
    try {
      await axiosInstance.put(`/api/v1/books/${bookId}/comments/${commentId}`, { content: editContent });
      alert("コメントを更新しました。");
      setEditingComment(null);
      fetchComments();
    } catch (error) {
      console.error("コメントの更新に失敗しました:", error);
      alert("コメントの更新中にエラーが発生しました。");
    }
  };

  if (!bookData) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-center space-y-4 ${!isMobile ? 'space-y-0 space-x-6' : ''} w-full max-w-5xl`}>
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

        <div className="mt-8 mb-28">
          <h3 className="text-bodyText font-semibold mb-4 text-gray-800">コメント一覧</h3>
          {comments.map((cmt) => (
            <div key={cmt.id} className="p-4 bg-white/50 rounded-md mb-4">
              <div className="flex justify-between items-center text-xs text-bodyText text-gray-500 mb-2">
                <span>{cmt.user.name}さんからのコメント</span>
                <span>{new Date(cmt.created_at).toLocaleString()}</span>
              </div>
              {editingComment?.id === cmt.id ? (
                // 編集モード
                <div className="flex flex-col space-y-2 w-full">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateComment(cmt.id)}
                      className="px-4 py-2 bg-customButton text-white rounded-md hover:bg-opacity-80"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent("");
                      }}
                      className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                // 通常表示モード
                <div className="flex justify-between items-center">
                  <p className="text-bodyText text-gray-800">{cmt.content}</p>
                  <div className="flex space-x-2">
                    {/* コメント投稿者と現在のユーザーが一致した場合のみ編集・削除表示 */}
                    {cmt.user.name === userName && (
                      <>
                        <button
                          onClick={() => handleCommentEdit(cmt)}
                          aria-label="コメントを編集する"
                          className="flex items-center text-gray-500 hover:text-gray-700 transition"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleCommentDelete(cmt.id)}
                          aria-label="コメントを削除する"
                          className="flex items-center text-gray-500 hover:text-gray-700 transition"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;

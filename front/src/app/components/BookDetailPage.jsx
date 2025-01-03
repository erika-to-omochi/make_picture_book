"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import axiosInstance from '../../api/axios';
import { FaRegCommentDots, FaEdit, FaTrash, FaRegFilePdf } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import useCanvasStore from '../../stores/canvasStore';
import useIsMobile from "@/hooks/useIsMobile";
import useAuthStore from '../../stores/authStore';
import { jsPDF } from 'jspdf';

const Canvas = dynamic(() => import("./Canvas"), { ssr: false });

function BookDetailPage() {
  const { bookId } = useParams();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { userName } = useAuthStore(); // ログイン中のユーザー名取得

  const commentSectionRef = useRef(null);

  const bookData = useCanvasStore((state) => state.bookData);
  const currentPageIndex = useCanvasStore((state) => state.currentPageIndex);
  const pages = useCanvasStore((state) => state.pages);
  const fetchBookData = useCanvasStore((state) => state.fetchBookData);

  const [isAuthor, setIsAuthor] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");

  const stageRef = useRef(null);

  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (bookId) {
      fetchBookData(bookId);
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
    if (bookId) {
      checkAuthorStatus();
    }
  }, [bookId]);

  const fetchComments = async () => {
    try {
      const response = await axiosInstance.get(`/api/v1/books/${bookId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error("コメントの取得に失敗しました", error);
    }
  };

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

  // XシェアURLの構築
  const handleShare = async () => {
    const ogpUrl = bookData.ogpUrl || `${process.env.NEXT_PUBLIC_API_BASE_URL}/default-og-image.png`;
    const tweetText = `絵本はどうですか🤗📕？: ${bookData.title} 作者: ${bookData.author_name}`;
    const shareUrl = `${window.location.origin}/books/${bookId}`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(tweetText)}&image=${encodeURIComponent(ogpUrl)}`;
    window.open(twitterShareUrl, '_blank', 'noopener,noreferrer');
  };

  if (!bookData)
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-semibold">Loading</p>
      <span className="loading loading-dots loading-lg"></span>
    </div>
  );

   // PDFエクスポートハンドラ
  const handleExportPDF = async () => {
    // A4サイズの設定（横向き）
    const A4_WIDTH = 841.89; // ピクセル
    const A4_HEIGHT = 595.28; // ピクセル
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [A4_WIDTH, A4_HEIGHT],
    });
    for (let i = 0; i < pages.length; i++) {
      useCanvasStore.getState().setCurrentPageIndex(i);
      // 再描画を待つ
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!stageRef.current || stageRef.current.width() === 0 || stageRef.current.height() === 0) {
        console.error("stageRef が正しく設定されていません。");
        continue;
      }
      // 現在のキャンバスの幅と高さ
      const canvasWidth = stageRef.current.width();
      const canvasHeight = stageRef.current.height();
      // キャンバスのアスペクト比
      const canvasAspectRatio = canvasWidth / canvasHeight
      // A4のアスペクト比
      const A4AspectRatio = A4_WIDTH / A4_HEIGHT;
      // 画像を縮小してA4に収める
      let scaledWidth, scaledHeight;
      if (canvasAspectRatio > A4AspectRatio) {
        // キャンバスが横に広い場合
        scaledWidth = A4_WIDTH;
        scaledHeight = (A4_WIDTH / canvasWidth) * canvasHeight;
      } else {
        // キャンバスが縦に広い場合
        scaledHeight = A4_HEIGHT;
        scaledWidth = (A4_HEIGHT / canvasHeight) * canvasWidth;
      }
      // 現在のページを画像データとして取得
      const dataURL = stageRef.current.toDataURL({
        pixelRatio: 2, // 高解像度化
        mimeType: "image/png",
      });
      if (i === 0) {
        pdf.addImage(dataURL, "PNG", 0, 0, scaledWidth, scaledHeight);
      } else {
        pdf.addPage([A4_WIDTH, A4_HEIGHT]);
        pdf.addImage(dataURL, "PNG", 0, 0, scaledWidth, scaledHeight);
      }
    }
    pdf.save("絵本ぽんっ.pdf");
  };

  const handleTagSearch = async (tag) => {
    setIsSearching(true);
    try {
      const response = await axiosInstance.get('/api/v1/books', {
        params: {
          tags: tag,
          page: 1,
          per_page: 9
        }
      });
      router.push(`/index-books?tags=${encodeURIComponent(tag)}`);
    } catch (error) {
      console.error("タグ検索中にエラーが発生しました:", error);
      alert("タグ検索中にエラーが発生しました");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      {pages.length > 0 && currentPageIndex >= 0 && currentPageIndex < pages.length && (
        <>
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            {bookData.title || "タイトルがありません"}
          </h2>
          {/* relativeコンテナでCanvasとアイコンを重ねて配置 */}
          <div className="relative flex justify-center">
            {/* Canvas */}
            <Canvas
              stageRef={stageRef}
              showActionButtons={false}
              isReadOnly={true}
              allowAddPage={false}
              showUndoButton={false}
              allowAddText={false}
            />
            {/* アイコン絶対配置：キャンバスの右側に4px */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                right: '-48px', // rightからマイナス方向へ4px分外側に出す
              }}
              className="flex flex-col space-y-1"
            >
              {isAuthor && (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex flex-col items-center justify-center p-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition w-10 h-10 md:w-16 md:h-16"
                  >
                    <FaEdit className="text-gray-700" size={24} />
                    <span className="mt-1 text-[0.6rem] hidden md:inline">編集する</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex flex-col items-center justify-center p-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition w-10 h-10 md:w-16 md:h-16"
                  >
                    <FaTrash className="text-gray-700" size={24} />
                    <span className="mt-1 text-[0.6rem] hidden md:inline">削除する</span>
                  </button>
                </>
              )}
              <button
                onClick={handleShare}
                aria-label="Xにシェアするボタン"
                className="flex flex-col items-center justify-center p-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition w-10 h-10 md:w-16 md:h-16"
              >
                <FaXTwitter className="text-gray-700" size={24} />
                <span className="mt-1 text-[0.6rem] hidden md:inline">シェア</span>
              </button>
              <button
                onClick={scrollToComments}
                aria-label="コメントを表示するボタン"
                className="flex flex-col items-center justify-center p-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition w-10 h-10 md:w-16 md:h-16"
              >
                <FaRegCommentDots className="text-gray-700" size={24} />
                <span className="mt-1 text-[0.6rem] hidden md:inline">コメント</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex flex-col items-center justify-center p-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition w-10 h-10 md:w-16 md:h-16"
              >
                <FaRegFilePdf className="text-gray-700" size={24} />
                <span className="mt-1 text-[0.5rem] hidden md:inline">PDF/印刷</span>
              </button>
            </div>
          </div>
          {/* #のタグ機能 */}
          <p className="text-gray-800 text-sm mt-2 text-center">
            {bookData.tags.map((tag, index) => (
              <span key={tag.id || `tag-${index}`} className="inline-block mr-2">
                <button
                  onClick={() => handleTagSearch(tag.name)}
                  className="text-blue-500 hover:underline"
                  aria-label={`${tag.name}で絞り込む`}
                >
                  #{tag.name}
                </button>
                {index < bookData.tags.length - 1 && ","}
              </span>
            ))}
          </p>
        </>
      )}
      {/* コメントセクションはキャンバスとアイコンを包むコンテナの下に配置 */}
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
              <div className="flex items-center text-xs text-bodyText text-gray-500 mb-2">
                <span className="mr-2">{cmt.user.name}さんからのコメント</span>
                {cmt.user.name === userName && (
                  <>
                    <button
                      onClick={() => handleCommentEdit(cmt)}
                      aria-label="コメントを編集する"
                      className="flex items-center text-gray-500 hover:text-gray-700 transition mx-2"
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
                <span className="ml-auto">{new Date(cmt.created_at).toLocaleString()}</span>
              </div>
              {editingComment?.id === cmt.id ? (
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
                <p className="text-bodyText text-gray-800 break-all">{cmt.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import axios from '../../api/axios';
import { FaRegCommentDots, FaPrint, FaEdit, FaTrash } from 'react-icons/fa';
import useCanvasStore from '../../stores/canvasStore';

const Canvas = dynamic(() => import("./Canvas"), { ssr: false });

function BookDetailPage() {
  const { bookId } = useParams();
  const router = useRouter();

  // Zustandストアから状態とアクションを取得
  const {
    bookData,
    setBookData,
    currentPageIndex,
    updateImage,
    deleteImage,
    pages,
    setPages,
    addImage,
  } = useCanvasStore();

  // 作者判定の状態管理
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const response = await axios.get(`/api/v1/books/${bookId}/`);
        if (response.data) {
          // サーバーからのページデータをクライアント側の形式に変換
          const formattedPages = response.data.pages.map((page) => {
            const content = {
              texts: [],
              images: [],
              backgroundColor: page.background_color || '#ffffff',
            };
            if (page.page_elements && Array.isArray(page.page_elements)) {
              page.page_elements.forEach((element) => {
                if (element.element_type === 'text') {
                  const { text, font_size, font_color, position_x, position_y } = element.content;
                  content.texts.push({
                    text,
                    fontSize: font_size,
                    color: font_color,
                    x: position_x,
                    y: position_y,
                  });
                } else if (element.element_type === 'image') {
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
          // 初期化
          setBookData(response.data);
          setPages(formattedPages);
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };
    fetchBookData();
  }, [bookId]);


  // 作者判定APIを呼び出し
  useEffect(() => {
    const checkAuthorStatus = async () => {
      try {
        const response = await axios.get(`/api/v1/books/${bookId}/author_status`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`, // ローカルストレージからトークンを取得
          },
        });
        setIsAuthor(response.data.is_author); // 作者かどうかを状態に設定
      } catch (error) {
        console.error("Error checking author status:", error);
      }
    };
    checkAuthorStatus();
  }, [bookId]);

  useEffect(() => {
    if (pages.length > 0 && currentPageIndex >= 0 && currentPageIndex < pages.length) {
      const currentPage = pages[currentPageIndex];
      if (currentPage?.content?.images) {
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
    router.push(`/books/${bookId}/edit`);
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
      {pages.length > 0 && pages[currentPageIndex]?.content?.texts && (
        <Canvas
          texts={pages[currentPageIndex].content.texts}
          images={pages[currentPageIndex].content.images}
          pageData={pages[currentPageIndex]}
          backgroundColor={pages[currentPageIndex]?.content?.backgroundColor || "#ffffff"} // ここで渡す
          onUpdateImage={updateImage}
          onDeleteImage={deleteImage}
          onSelectText={(index) => {
            useCanvasStore.getState().setSelectedTextIndex(index);
          }}
          showActionButtons={false}
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

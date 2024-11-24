'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import useCanvasStore from '../../stores/canvasStore';
import axios from '../../api/axios';
import { useRouter } from 'next/navigation';

export default function ModalManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'complete' または 'draft'
  const [modalData, setModalData] = useState({
    title: "",
    author: "",
    tags: "",
    visibility: "public",
  });

  const { pages, resetCanvas, bookData } = useCanvasStore(); // bookDataを直接取得
  const router = useRouter();

    // モーダル開閉ロジック
    const openModal = (type) => {
      setModalType(type);
      // BookIdが存在する場合は初期値をセット
      if (bookData?.id) {
        setModalData({
          title: bookData.title || "",
          author: bookData.author_name || "",
          tags: bookData.tags || "",
          visibility: bookData.visibility === 0 ? "public" : "private",
        });
      } else {
        // 初期値を空白にリセット
        setModalData({
          title: "",
          author: "",
          tags: "",
          visibility: "public",
        });
      }
      setIsModalOpen(true);
    };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleModalChange = (field, value) => {
    setModalData((prev) => ({ ...prev, [field]: value }));
  };

  // トークン管理関数
  const checkTokenExpiration = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Failed to parse token:", error);
      return true; // トークンが無効とみなす
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      alert("リフレッシュトークンがありません。再度ログインしてください。");
      throw new Error("リフレッシュトークンがありません");
    }

    // トークンの有効期限を確認し、必要であれば更新
    if (checkTokenExpiration(token)) {
      token = await refreshAccessToken();
    }

    try {
      const response = await axios.post('/auth/refresh', { refresh_token: refreshToken });
      const newAccessToken = response.data.access_token;
      localStorage.setItem('access_token', newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      alert("ログインセッションが切れています。再度ログインしてください。");
      throw error;
    }
  };

  // モーダル保存処理
  const handleModalSave = async () => {
    try {
      // 書籍データのペイロード
      const bookDataPayload = {
        title: modalData.title,
        author_name: modalData.author,
        tags: modalData.tags,
        visibility: modalData.visibility === 'public' ? 0 : 1,
        is_draft: modalType === 'draft',
      };

      let newBookId = bookData?.id || null;
      let isUpdate = false;

      // 書籍の更新または新規作成
      if (newBookId) {
        // 更新
        const updateBookResponse = await axios.put(`/api/v1/books/${newBookId}`, bookDataPayload);
        console.log(`Book updated with id: ${updateBookResponse.data.book.id}`);
        isUpdate = true;
      } else {
        // 新規作成
        const createBookResponse = await axios.post('/api/v1/books', bookDataPayload);
        newBookId = createBookResponse.data.book.id;
        console.log(`New book created with id: ${newBookId}`);
      }

      // ページの更新または新規作成
      for (const page of pages) {
        const transformedTexts = page.content.texts.map((text) => ({
          text: text.text,
          font_size: text.fontSize,
          font_color: text.color,
          position_x: text.x,
          position_y: text.y,
          rotation: text.rotation || 0,
          scale_x: text.scaleX || 1,
          scale_y: text.scaleY || 1,
        }));

        const transformedImages = page.content.images.map((image) => ({
          src: image.src,
          position_x: image.x,
          position_y: image.y,
          rotation: image.rotation || 0,
          scale_x: image.scaleX || 1,
          scale_y: image.scaleY || 1,
        }));

        const payload = {
          page: {
            book_id: newBookId,
            page_number: page.page_number,
            content: {
              background_color: page.content.backgroundColor || '#ffffff',
              texts: transformedTexts,
              images: transformedImages,
            },
          },
        };

        if (page.id) {
          // ページ更新
          await axios.put(`/api/v1/books/${newBookId}/pages/${page.id}`, payload);
        } else {
          // 新規作成
          await axios.post(`/api/v1/books/${newBookId}/pages`, payload);
        }
      }

      // 保存完了メッセージの表示
      if (isUpdate) {
        alert('更新が完了しました');
      } else {
        alert('保存が完了しました');
      }

      resetCanvas();
      closeModal();
      router.push('/index-books');
    } catch (error) {
      console.error("保存中にエラーが発生しました:", error);
      alert("保存中にエラーが発生しました");
    }
  };

  return (
    <>
      <button
        onClick={() => openModal("complete")}
        className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80"
      >
        完成
      </button>
      <button
        onClick={() => openModal("draft")}
        className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80"
      >
        下書き保存
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleModalSave}
        modalType={modalType}
        title={modalData.title}
        setTitle={(value) => handleModalChange("title", value)}
        author={modalData.author}
        setAuthor={(value) => handleModalChange("author", value)}
        tags={modalData.tags}
        setTags={(value) => handleModalChange("tags", value)}
        visibility={modalData.visibility}
        setVisibility={(value) => handleModalChange("visibility", value)}
      />
    </>
  );
}

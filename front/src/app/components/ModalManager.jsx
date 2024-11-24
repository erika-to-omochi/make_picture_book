// src/app/components/ModalManager.jsx
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

  const {
    pages,
    currentPageIndex,
    resetCanvas,
  } = useCanvasStore();

  const router = useRouter();

  // トークン管理の関数（必要に応じて）
  const checkTokenExpiration = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Failed to parse token:", error);
      return true; // トークンが無効な場合も期限切れとみなす
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.error("Refresh token is missing.");
      alert("リフレッシュトークンがありません。再度ログインしてください。");
      throw new Error("リフレッシュトークンがありません");
    }

    try {
      const response = await axios.post('/auth/refresh', {
        refresh_token: refreshToken,
      });
      const newAccessToken = response.data.access_token;
      localStorage.setItem('access_token', newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Failed to refresh token:", error.response || error);
      alert("ログインセッションが切れています。再度ログインしてください。");
      throw error;
    }
  };

  // モーダルを開く関数
  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // モーダルを閉じる関数
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // モーダルデータの更新関数
  const handleModalChange = (field, value) => {
    setModalData((prev) => ({ ...prev, [field]: value }));
  };

  // モーダル保存時の処理
  const handleModalSave = async () => {
    try {
      let token = localStorage.getItem('access_token');
      if (!token) {
        console.error("Token is missing!");
        alert("ログイン状態が無効です。再度ログインしてください。");
        return;
      }

      if (checkTokenExpiration(token)) {
        console.log("Token has expired, refreshing...");
        token = await refreshAccessToken();
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const bookDataPayload = {
        title: modalData.title,
        author_name: modalData.author,
        description: modalData.description || '',
        visibility: modalData.visibility === 'public' ? 0 : 1,
        is_draft: modalType === 'draft',
      };

      // 新しい書籍を作成
      const createBookResponse = await axios.post('/api/v1/books', bookDataPayload, { headers });
      const newBookId = createBookResponse.data.book.id;
      console.log(`New book created with id: ${newBookId}`);

      // ページごとに保存
      for (const page of pages) {
        const payload = {
          page: {
            book_id: newBookId,
            page_number: page.page_number,
            content: {
              title: page.content.title,
              author: page.content.author,
              tags: page.content.tags,
              backgroundColor: page.content.backgroundColor,
              visibility: page.content.visibility,
              texts: page.content.texts.map(text => ({
                text: text.text,
                font_size: text.fontSize,
                color: text.color,
                x: text.x,
                y: text.y,
                rotation: text.rotation || 0,
                scaleX: text.scaleX || 1,
                scaleY: text.scaleY || 1,
              })),
              images: page.content.images.map(image => ({
                src: image.src,
                x: image.x,
                y: image.y,
                width: image.width,
                height: image.height,
              })),
            },
            page_elements_attributes: [
              ...page.content.texts.map(text => ({
                element_type: 'text',
                content: {
                  text: text.text,
                  font_size: text.fontSize,
                  font_color: text.color,
                  position_x: text.x,
                  position_y: text.y,
                },
              })),
              ...page.content.images.map(image => ({
                element_type: 'image',
                content: {
                  src: image.src,
                  width: image.width,
                  height: image.height,
                  position_x: image.x,
                  position_y: image.y,
                },
              })),
            ],
          }
        };
        await axios.post(`/api/v1/books/${newBookId}/pages`, payload, { headers });
      }

      alert('保存が完了しました');

      // キャンバスをリセット
      resetCanvas();

      closeModal();

      router.push('/index-books');
    } catch (error) {
      console.error('Failed to save book:', error.response || error);
      if (error.response?.data?.errors) {
        const errorMessage = error.response.data.errors.join(", ");
        alert(`保存エラー: ${errorMessage}`);
      } else {
        alert('保存中にエラーが発生しました');
      }
    }
  };

  return (
    <>
      {/* 完成ボタン */}
      <button
        onClick={() => openModal("complete")}
        className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80"
      >
        完成
      </button>

      {/* 下書き保存ボタン */}
      <button
        onClick={() => openModal("draft")}
        className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80"
      >
        下書き保存
      </button>

      {/* モーダル本体 */}
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

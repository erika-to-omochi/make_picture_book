'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import useCanvasStore from '../../stores/canvasStore';
import axiosInstance from '../../api/axios';
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

  const [isLoading, setIsLoading] = useState(false); // ローディング状態
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

  // モーダル保存処理
  const handleModalSave = async () => {
    setIsLoading(true);
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
        const updateBookResponse = await axiosInstance.put(`/api/v1/books/${newBookId}`, bookDataPayload);
        isUpdate = true;
      } else {
        // 新規作成
        const createBookResponse = await axiosInstance.post('/api/v1/books', bookDataPayload);
        newBookId = createBookResponse.data.book.id;
        console.log(`New book created with id: ${newBookId}`);
      }

      console.log("Pages before saving:", pages);

      // ページの更新または新規作成
      for (const page of pages) {
        // page_elements の構築
        const pageElements = page.pageElements
          // 空のテキスト要素を除外
          .filter(el => !(el.elementType === 'text' && (!el.text || el.text.trim() === "")))
          // 必要なフィールドに変換
          .map(el => {
            if (el.elementType === 'text') {
              return {
                element_type: 'text',
                text: el.text || null, // 空の場合は null に設定
                font_size: el.fontSize,
                font_color: el.fontColor,
                position_x: el.positionX,
                position_y: el.positionY,
                rotation: el.rotation || 0,
                scale_x: el.scaleX || 1,
                scale_y: el.scaleY || 1,
              };
            } else if (el.elementType === 'image') {
              return {
                element_type: 'image',
                src: el.src,
                position_x: el.positionX,
                position_y: el.positionY,
                rotation: el.rotation || 0,
                scale_x: el.scaleX || 1,
                scale_y: el.scaleY || 1,
              };
            }
            return null; // 他のタイプがあれば適宜処理
          })
          .filter(el => el !== null); // 不要な null を除外

        // page_characters の構築（今後本リリースで修正していく）
        const pageCharacters = page.page_characters || [];

        const payload = {
          page: {
            book_id: newBookId,
            page_number: page.pageNumber,
            background_color: page.backgroundColor || '#ffffff',
            page_elements_attributes: pageElements,
            page_characters_attributes: pageCharacters,
          },
        };

        if (page.id) {
          // ページ更新
          await axiosInstance.put(`/api/v1/books/${newBookId}/pages/${page.id}`, payload);
        } else {
          // 新規作成
          await axiosInstance.post(`/api/v1/books/${newBookId}/pages`, payload);
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
      router.push('/myPage');
    } catch (error) {
      console.error("保存中にエラーが発生しました:", error);
      alert("保存中にエラーが発生しました");
    } finally {
      setIsLoading(false);
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
        下書き
      </button>
      {/* ローディングインジケーターの表示 */}
      {isLoading && (
        <span className="loading loading-dots loading-lg mt-4"></span>
      )}
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

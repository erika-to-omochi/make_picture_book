'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import useCanvasStore from '../../stores/canvasStore';
import useBooksStore from '../../stores/booksStore'; // 追加
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

  // useBooksStoreとuseCanvasStoreから必要な関数を取得
  const fetchMyBooks = useBooksStore((state) => state.fetchMyBooks);
  const fetchBookData = useCanvasStore((state) => state.fetchBookData);

  // モーダル開閉ロジック
  const openModal = (type) => {
    setModalType(type);
    // BookIdが存在する場合は初期値をセット
    if (bookData?.id) {
      setModalData({
        title: bookData.title || "",
        author: bookData.author_name || "",
        tags: bookData.tags.map(tag => tag.name).join(", ") || "",
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
      const bookDataPayload = {
        book: {
          title: modalData.title,
          author_name: modalData.author,
          tags: modalData.tags.split(",").map(tag => tag.trim()),
          visibility: modalData.visibility === 'public' ? 0 : 1,
          is_draft: modalType === 'draft',
        },
      };
      let newBookId = bookData?.id || null;
      let isUpdate = false;

      if (newBookId) {
        await axiosInstance.put(`/api/v1/books/${newBookId}`, bookDataPayload);
        isUpdate = true;
      } else {
        const createBookResponse = await axiosInstance.post('/api/v1/books', bookDataPayload);
        newBookId = createBookResponse.data.book.id;
        console.log(`New book created with id: ${newBookId}`);
      }

      for (const page of pages) {
        // 削除対象のキャラクターを取得
        const charactersToDelete = (page.charactersToDelete || []).map(char => ({
          id: typeof char.id === 'number' ? char.id : parseInt(char.id, 10),
          _destroy: true,
        }));

        // 削除対象のページ要素を取得
        const elementsToDelete = (page.elementsToDelete || []).map(el => ({
          id: typeof el.id === 'number' ? el.id : parseInt(el.id, 10),
          _destroy: true,
        }));

        const pageElements = page.pageElements
          .filter(el => !(el.elementType === 'text' && (!el.text || el.text.trim() === "")))
          .map(el => {
            const baseAttrs = {
              element_type: el.elementType,
              text: el.elementType === 'text' ? (el.text || null) : null,
              src: el.elementType === 'image' ? el.src : null,
              font_size: el.fontSize || null,
              font_color: el.fontColor || null,
              position_x: el.positionX,
              position_y: el.positionY,
              rotation: el.rotation || 0,
              scale_x: el.scaleX || 1,
              scale_y: el.scaleY || 1,
              _destroy: false,
            };
            if (el.id && typeof el.id === 'string' && !el.id.startsWith('_')) {
              baseAttrs.id = parseInt(el.id, 10);
            } else if (typeof el.id === 'number') {
              baseAttrs.id = el.id;
            }
            return baseAttrs;
          });

        const pageCharacters = page.pageCharacters.map(char => ({
          element_type: 'character',
          position_x: char.positionX || 100,
          position_y: char.positionY || 100,
          rotation: char.rotation || 0,
          scale_x: char.scaleX || 1,
          scale_y: char.scaleY || 1,
          parts: char.parts || [],
          _destroy: false,
          id: typeof char.id === 'number' ? char.id : undefined,
        }));

        const payload = {
          page: {
            book_id: newBookId,
            page_number: page.pageNumber,
            background_color: page.backgroundColor || '#ffffff',
            page_elements_attributes: [...pageElements, ...elementsToDelete],
            page_characters_attributes: [...pageCharacters, ...charactersToDelete],
          },
        };
        if (page.id) {
          await axiosInstance.put(`/api/v1/books/${newBookId}/pages/${page.id}`, payload);
        } else {
          await axiosInstance.post(`/api/v1/books/${newBookId}/pages`, payload);
        }
      }
      if (isUpdate) {
        alert('更新が完了しました');
      } else {
        alert('保存が完了しました');
      }

      resetCanvas();
      closeModal();

      if (modalType === 'draft') {
        await fetchMyBooks();
        await fetchBookData(newBookId);
      } else {
        router.push('/myPage');
      }
    } catch (error) {
      console.error("保存中にエラーが発生しました:", error);
      alert("保存中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // キーボードショートカットの設定
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isSaveShortcut = isMac
        ? event.metaKey && event.key === 's'
        : event.ctrlKey && event.key === 's';
      if (isSaveShortcut) {
        event.preventDefault();
        openModal("draft"); // 下書きモードでモーダルを開く
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    // クリーンアップ
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [bookData]);

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

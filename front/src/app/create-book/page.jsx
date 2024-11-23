'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import CreateBookFooter from '../components/CreateBookFooter';
import useCanvasStore from '../../stores/canvasStore';
import axios from '../../api/axios';

const Canvas = dynamic(() => import('../components/Canvas'), {
  ssr: false,
});

export default function CreateBookPage() {
  const [activePanel, setActivePanel] = useState(null);

  const {
    pages,
    currentPageIndex,
    handleAddText,
    updateImage,
    selectedTextIndex,
    backgroundColor,
    setBackgroundColor,
  } = useCanvasStore();

  const currentPage = pages[currentPageIndex] || {
    content: { texts: [], images: [], backgroundColor: '#ffffff' },
  };

  // 新しい書籍とページを保存する関数
  const handleModalSave = async () => {
    try {
      let token = localStorage.getItem('access_token');
      if (!token) {
        console.error("Token is missing!");
        alert("ログイン状態が無効です。再度ログインしてください。");
        return;
      };


      if (checkTokenExpiration(token)) {
        console.log("Token has expired, refreshing...");
        token = await refreshAccessToken();
      };

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // 新しい書籍を作成
      const newBookData = {
        title: modalData.title,
        author_name: modalData.author,
        description: modalData.description || '',
        visibility: modalData.visibility === 'public' ? 0 : 1,
        is_draft: modalType === 'draft',
      };

      const createBookResponse = await axios.post('/api/v1/books', newBookData, { headers });
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
      closeModal();
      // 必要に応じてリダイレクトやストアのリセットを行う
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

  // トークンの有効期限をチェック
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

  // リフレッシュトークンを使用してアクセストークンを更新
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.error("Refresh token is missing.");
      alert("リフレッシュトークンがありません。再度ログインしてください。");
      throw new Error("リフレッシュトークンがありません");
    };

    try {
      const response = await axios.post('/auth/refresh', {
        refresh_token: refreshToken,
      });
      const newAccessToken = response.data.access_token;
      localStorage.setItem('access_token', newAccessToken); // 新しいアクセストークンを保存
      return newAccessToken;
    } catch (error) {
      console.error("Failed to refresh token:", error.response || error);
      alert("ログインセッションが切れています。再度ログインしてください。");
      throw error;
    }
  };

  const togglePanel = (panelName) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };

  // 画像のプロパティを更新
  const handleUpdateImage = (index, updatedProperties) => {
    updateImage(index, updatedProperties);
  };

  // 「完成」ボタンの処理
  const onComplete = () => {
    console.log("Document completed", { pages });
    alert("Document completed!");
    // 必要に応じてバックエンドへの保存処理などを追加
  };

  // 「下書き保存」ボタンの処理
  const onSaveDraft = () => {
    console.log("Document saved as draft", { pages });
    alert("Draft saved!");
  };

  return (
    <div>
      <Canvas
        backgroundColor={backgroundColor}
        onComplete={onComplete}
        onSaveDraft={onSaveDraft}
        showActionButtons={true}
      />

      <CreateBookFooter
        activePanel={activePanel}
        togglePanel={togglePanel}
        handleAddText={handleAddText}
        setBackgroundColor={setBackgroundColor}
      />
    </div>
  );
}

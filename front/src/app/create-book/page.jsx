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
    backgroundColor,
    setBackgroundColor,
  } = useCanvasStore();

  const currentPage = pages[currentPageIndex] || {
    content: { texts: [], images: [], backgroundColor: '#ffffff' },
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

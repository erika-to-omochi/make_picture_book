'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import CreateBookFooter from '../components/CreateBookFooter';
import useCanvasStore from '../../stores/canvasStore';
import useAuthStore from '../../stores/authStore';

const Canvas = dynamic(() => import('../components/Canvas'), {
  ssr: false,
});

export default function CreateBookPage() {
  const [activePanel, setActivePanel] = useState(null);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const {
    pages,
    currentPageIndex,
    handleAddText,
    setBackgroundColor,
    resetCanvas,
  } = useCanvasStore();

  const currentPage = pages[currentPageIndex] || {
    pageElements: [],
    pageCharacters: [],
    backgroundColor: '#ffffff',
  };

  useEffect(() => {
    if (!isAuthenticated) {
      alert('ログインが必要です');
      router.push('/login'); // ログインページにリダイレクト
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // 作成ページに遷移したらストアをリセット
    resetCanvas();
  }, [resetCanvas]);

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
        backgroundColor={currentPage.backgroundColor}
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

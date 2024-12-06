'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import CreateBookFooter from '../components/CreateBookFooter';
import useCanvasStore from '../../stores/canvasStore';
import useAuthStore from '../../stores/authStore';
import { useRouter } from 'next/navigation';
import useIsMobile from '@/hooks/useIsMobile';

const Canvas = dynamic(() => import('../components/Canvas'), {
  ssr: false,
});

export default function CreateBookPage() {
  const [activePanel, setActivePanel] = useState(null);
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

  const { isLoggedIn, userName } = useAuthStore();
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    // 作成ページに遷移したらストアをリセット
    resetCanvas();
  }, [resetCanvas]);

  useEffect(() => {
    if (!isLoggedIn) {
      alert('このページにアクセスするにはログインが必要です。ログインページに移動します。');
      router.push('/login'); // ログインページのパスに変更してください
    }
  }, [isLoggedIn, router]);

  const togglePanel = (panelName) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };

  // パネルを設定する関数（Canvas用）
  const setPanel = (panelName) => {
    setActivePanel(panelName);
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
    <div className={`flex flex-col overflow-y-auto ${isMobile ? 'items-center' : 'items-end'}`}>
      <div className={`max-w-none ${isMobile ? 'mx-auto' : 'mr-10'}`}>
        <Canvas
          backgroundColor={currentPage.backgroundColor}
          onComplete={onComplete}
          onSaveDraft={onSaveDraft}
          showActionButtons={true}
          showUndoButton={true}
          allowAddPage={true}
          setPanel={setPanel}
          togglePanel={togglePanel}
          activePanel={activePanel}
        />
        </div>

      <CreateBookFooter
        activePanel={activePanel}
        togglePanel={togglePanel}
        handleAddText={handleAddText}
        setBackgroundColor={setBackgroundColor}
      />
    </div>
  );
}

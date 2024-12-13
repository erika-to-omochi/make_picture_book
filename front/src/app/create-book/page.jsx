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

const Modal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
        <h2 className="text-lg font-semibold mb-4">ログインが必要です</h2>
        <p className="mb-4 text-gray-600">このページを使用するにはログインが必要です。ログインしない場合は一覧ページへいきます。</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onLogin}
            className="px-4 py-2 p-2 bg-customButton text-white rounded-md hover:bg-opacity-80"
          >
            ログイン
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            一覧ページ
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CreateBookPage() {
  const [activePanel, setActivePanel] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { pages, currentPageIndex, handleAddText, setBackgroundColor, resetCanvas } = useCanvasStore();

  const currentPage = pages[currentPageIndex] || {
    pageElements: [],
    pageCharacters: [],
    backgroundColor: '#ffffff',
  };

  const { isLoggedIn, isHydrated } = useAuthStore();
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    // 作成ページに遷移したらストアをリセット
    resetCanvas();
  }, [resetCanvas]);

  useEffect(() => {
    // ハイドレーションが完了してからログイン状態をチェック
    if (isHydrated && !isLoggedIn) {
      setShowLoginModal(true); // モーダルを表示
    }
  }, [isLoggedIn, isHydrated]);

  const togglePanel = (panelName) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };

  // モーダルで「ログイン」を選択した場合
  const handleLoginRedirect = () => {
    router.push('/login'); // ログインページに移動
  };

  // モーダルで「キャンセル」を選択した場合
  const handleIndexRedirect = () => {
    router.push('/index-books');
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
          togglePanel={togglePanel} // togglePanel を直接渡す
          activePanel={activePanel}
        />
      </div>

      <CreateBookFooter
        activePanel={activePanel}
        togglePanel={togglePanel}
        handleAddText={handleAddText}
        setBackgroundColor={setBackgroundColor}
      />

      {/* ログインモーダル */}
      <Modal
        isOpen={showLoginModal}
        onClose={handleIndexRedirect}
        onLogin={handleLoginRedirect}
      />
    </div>
  );
}

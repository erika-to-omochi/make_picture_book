'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import CreateBookFooter from '../components/CreateBookFooter';
import useCanvasStore from '../../stores/canvasStore'; // Zustandストアをインポート

const Canvas = dynamic(() => import('../components/Canvas'), {
  ssr: false,
});

export default function CreateBookPage() {
  const [activePanel, setActivePanel] = useState(null);
  const [texts, setTexts] = useState([]);
  const [selectedTextIndex, setSelectedTextIndex] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState("white");

  // ZustandストアからaddImageアクションを取得
  const addImage = useCanvasStore((state) => state.addImage);

  const togglePanel = (panelName) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };

  const handleAddText = (newText) => {
    if (typeof window === "undefined") return;

    const width = window.innerWidth * 0.9;
    const height = width * 0.6;
    const centerX = width / 2;
    const centerY = height / 2;

    const textWithPosition = {
      ...newText,
      x: centerX,
      y: centerY
    };
    setTexts((prevTexts) => [...prevTexts, textWithPosition]);
  };

  const handleAddImage = (src) => {
    console.log("handleAddImage called with:", src);

    const img = new window.Image();
    img.src = src;

    img.onload = () => {
      console.log("Image loaded successfully:", src);
      addImage(src); // ZustandのaddImageを呼び出す
      console.log("Image added to store");
    };

    img.onerror = () => {
      console.error("Failed to load image:", src);
    };
  };

  const handleUpdateImage = (index, updatedProperties) => {
    // ZustandストアのupdateImageアクションを使用
    useCanvasStore.getState().updateImage(index, updatedProperties);
  };

  const handleSelectText = (index) => {
    setSelectedTextIndex(index);
  };

  const selectedText = selectedTextIndex !== null ? texts[selectedTextIndex] : null;

  // テキストプロパティの更新
  const handleUpdateText = (updatedProperties) => {
    if (selectedTextIndex !== null) {
      const updatedTexts = [...texts];
      updatedTexts[selectedTextIndex] = { ...updatedTexts[selectedTextIndex], ...updatedProperties };
      setTexts(updatedTexts);
    }
  };

  // テキストの位置、回転、フォントサイズの更新
  const handleUpdateTextFromCanvas = (index, updatedProperties) => {
    const updatedTexts = [...texts];
    updatedTexts[index] = { ...updatedTexts[index], ...updatedProperties };
    setTexts(updatedTexts);
  };

  const handleDeleteText = (index) => {
    const newTexts = texts.filter((_, i) => i !== index);
    setTexts(newTexts);
    setSelectedTextIndex(null);
  };

  const handleDeleteImage = (index) => {
    useCanvasStore.getState().deleteImage(index);
    setSelectedTextIndex(null);
  };

  // 「完成」ボタンの処理
  const onComplete = () => {
    console.log("Document completed", { texts });
    alert("Document completed!");
    // 必要に応じてバックエンドへの保存処理などを追加
  };

  // 「下書き保存」ボタンの処理
  const onSaveDraft = () => {
    console.log("Document saved as draft", { texts });
    alert("Draft saved!");
    // 下書き保存のための処理を追加（例：ローカルストレージやバックエンドに一時保存）
  };

  return (
    <div>
      <Canvas
        texts={texts}
        onSelectText={handleSelectText}
        onDeleteText={handleDeleteText}
        onUpdateText={handleUpdateTextFromCanvas}
        onUpdateImage={handleUpdateImage}
        onDeleteImage={handleDeleteImage}
        backgroundColor={backgroundColor}
        onComplete={onComplete}
        onSaveDraft={onSaveDraft}
      />

      <CreateBookFooter
        activePanel={activePanel}
        togglePanel={togglePanel}
        handleAddText={handleAddText}
        handleAddImage={handleAddImage}
        handleSelectText={handleSelectText}
        handleUpdateText={handleUpdateText}
        handleDeleteText={handleDeleteText}
        texts={texts}
        selectedText={selectedText}
        setBackgroundColor={setBackgroundColor}
      />
    </div>
  );
}

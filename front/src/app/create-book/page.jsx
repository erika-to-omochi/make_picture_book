'use client';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import CreateBookFooter from '../components/CreateBookFooter';

const Canvas = dynamic(() => import('../components/Canvas'), {
  ssr: false,
});

export default function CreateBookPage() {
  const [activePanel, setActivePanel] = useState(null);
  const [texts, setTexts] = useState([]);
  const [selectedTextIndex, setSelectedTextIndex] = useState(null);

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

  return (
    <div>
      <Canvas
        texts={texts}
        onSelectText={handleSelectText}
        onDeleteText={handleDeleteText}
        onUpdateText={handleUpdateTextFromCanvas}
      />

      <CreateBookFooter
        activePanel={activePanel}
        togglePanel={togglePanel}
        handleAddText={handleAddText}
        handleSelectText={handleSelectText}
        handleUpdateText={handleUpdateText}
        handleDeleteText={handleDeleteText}
        texts={texts}
        selectedText={selectedText}
      />
    </div>
  );
}

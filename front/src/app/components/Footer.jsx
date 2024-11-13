"use client";

import Link from "next/link";
import { useState } from "react";
import { FaBook, FaEdit, FaInfoCircle, FaTree, FaUser, FaTextWidth, FaLightbulb } from "react-icons/fa";
import { usePathname } from "next/navigation";
import TextInputCanvas from "./TextInputCanvas";
import Canvas from "./Canvas";

console.log("Canvas imported in Footer.jsx:", Canvas);

function DefaultFooter() {
  return (
    <footer
      className="flex justify-center gap-8 p-4 text-bodyText text-sm"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        position: "fixed",
        bottom: 0,
        width: "100%",
      }}
    >
      <Link href="/index-books" className="flex flex-col items-center mx-2">
        <FaBook size={32} className="text-icon" />
        <span>見る</span>
      </Link>
      <Link href="/create-book" className="flex flex-col items-center mx-2">
        <FaEdit size={32} className="text-icon" />
        <span>作る</span>
      </Link>
      <Link href="/app-guide" className="flex flex-col items-center mx-2">
        <FaInfoCircle size={32} className="text-icon" />
        <span>使い方</span>
      </Link>
    </footer>
  );
}

function CreateBookFooter() {
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

  // テキストプロパティの更新（TextInputCanvas から）
  const handleUpdateText = (updatedProperties) => {
    if (selectedTextIndex !== null) {
      const updatedTexts = [...texts];
      updatedTexts[selectedTextIndex] = { ...updatedTexts[selectedTextIndex], ...updatedProperties };
      setTexts(updatedTexts);
    }
  };

  // テキストの位置、回転、フォントサイズの更新（Canvas から）
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
    <>
      {activePanel && (
  <div
    className="fixed left-0 bottom-0 w-full h-1/3 shadow-lg p-4 transition-transform duration-300"
    style={{
      transform: activePanel ? "translateY(0)" : "translateY(100%)",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
    }}
  >
    <h2 className="text-lg font-bold mb-4">{activePanel}の内容</h2>

    {/* "文字" パネルがアクティブのときに TextInputCanvas を表示 */}
    {activePanel === "文字" ? (
      <TextInputCanvas
        onAddText={handleAddText}
        onUpdateText={handleUpdateText}
        selectedText={selectedText}
      />
    ) : (
      <div className="grid grid-cols-4 gap-4">
        {activePanel === "自然" && (
          <>
            <div className="w-12 h-12 bg-green-300 flex items-center justify-center">🌲</div>
            <div className="w-12 h-12 bg-green-300 flex items-center justify-center">🌿</div>
            <div className="w-12 h-12 bg-green-300 flex items-center justify-center">🌸</div>
          </>
        )}
        {activePanel === "人物" && (
          <>
            <div className="w-12 h-12 bg-blue-300 flex items-center justify-center">👤</div>
            <div className="w-12 h-12 bg-blue-300 flex items-center justify-center">👥</div>
            <div className="w-12 h-12 bg-blue-300 flex items-center justify-center">👶</div>
          </>
        )}
        {activePanel === "もの" && (
          <>
            <div className="w-12 h-12 bg-yellow-300 flex items-center justify-center">💡</div>
            <div className="w-12 h-12 bg-yellow-300 flex items-center justify-center">📦</div>
            <div className="w-12 h-12 bg-yellow-300 flex items-center justify-center">🎒</div>
          </>
        )}
      </div>
    )}
  </div>
)}

      <Canvas
        texts={texts}
        onSelectText={handleSelectText}
        onDeleteText={handleDeleteText}
        onUpdateText={handleUpdateTextFromCanvas}
      />

      {/* CREATE-BOOKページ専用のフッター */}
      <footer
        className="flex justify-center gap-8 p-4 text-bodyText text-sm"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          position: "fixed",
          bottom: 0,
          width: "100%",
        }}
      >
        <button onClick={() => togglePanel("自然")} className="flex flex-col items-center mx-2">
          <FaTree size={32} className="text-icon" />
          <span>自然</span>
        </button>
        <button onClick={() => togglePanel("人物")} className="flex flex-col items-center mx-2">
          <FaUser size={32} className="text-icon" />
          <span>人物</span>
        </button>
        <button onClick={() => togglePanel("文字")} className="flex flex-col items-center mx-2">
          <FaTextWidth size={32} className="text-icon" />
          <span>文字</span>
        </button>
        <button onClick={() => togglePanel("もの")} className="flex flex-col items-center mx-2">
          <FaLightbulb size={32} className="text-icon" />
          <span>もの</span>
        </button>
      </footer>
    </>
  );
}

// Footer（ページパスに応じて適切なフッターを表示）
export default function Footer() {
  const pathname = usePathname();
  const isCreateBookPage = pathname === "/create-book";

  return isCreateBookPage ? <CreateBookFooter /> : <DefaultFooter />;
}

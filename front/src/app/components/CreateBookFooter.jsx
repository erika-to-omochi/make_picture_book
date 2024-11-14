"use client";

import { FaTree, FaUser, FaBriefcase } from "react-icons/fa";
import { MdFormatColorFill, MdOutlineTextFields } from "react-icons/md";
import TextInputCanvas from "./TextInputCanvas";
import PeopleImages from "./PeopleImages";
import NatureImages from "./NatureImages";
import ObjectImages from "./ObjectImages";

export default function CreateBookFooter({
  activePanel,
  togglePanel,
  handleAddText,
  handleSelectText,
  handleUpdateText,
  handleDeleteText,
  texts,
  selectedText,
  handleAddImage,
  setBackgroundColor
}) {
  // パネルごとのコンテンツを関数として定義
  const renderPanelContent = () => {
    switch (activePanel) {
      case "文字":
        return (
          <TextInputCanvas
            onAddText={handleAddText}
            onUpdateText={handleUpdateText}
            selectedText={selectedText}
          />
        );
      case "自然":
        return <NatureImages onImageSelect={handleImageSelect} />;
      case "人物":
        return <PeopleImages onImageSelect={handleImageSelect} />;
      case "もの":
        return <ObjectImages onImageSelect={handleImageSelect} />;
        case "背景色":
          return (
            <div className="flex items-center p-4 gap-2">
              <label>背景色を選択:</label>
              <input
                type="color"
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-12"
              />
            </div>
          );
      default:
        return null;
    }
  };

  const handleImageSelect = (src) => {
    // 選択した画像パスを handleAddImage に渡す
    handleAddImage(src);
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
          <h2 className="text-lg font-bold mb-4">{activePanel}を選ぶ</h2>
          {renderPanelContent()}
        </div>
      )}

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
        <button onClick={() => togglePanel("人物")} className="flex flex-col items-center mx-2">
          <FaUser size={32} className="text-icon" />
          <span>人物</span>
        </button>
        <button onClick={() => togglePanel("自然")} className="flex flex-col items-center mx-2">
          <FaTree size={32} className="text-icon" />
          <span>自然</span>
        </button>
        <button onClick={() => togglePanel("もの")} className="flex flex-col items-center mx-2">
          <FaBriefcase size={32} className="text-icon" />
          <span>もの</span>
        </button>
        <button onClick={() => togglePanel("文字")} className="flex flex-col items-center mx-2">
          <MdOutlineTextFields size={32} className="text-icon" />
          <span>文字</span>
        </button>
        <button onClick={() => togglePanel("背景色")} className="flex flex-col items-center">
          <MdFormatColorFill size={32} className="text-icon" />
          <span>背景</span>
        </button>
      </footer>
    </>
  );
}

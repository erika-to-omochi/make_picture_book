"use client";

import { useEffect, useMemo } from "react";
import { FaTree, FaUser, FaBriefcase } from "react-icons/fa";
import { MdFormatColorFill, MdOutlineTextFields } from "react-icons/md";
import TextInputCanvas from "./TextInputCanvas";
import PeopleImages from "./PeopleImages";
import NatureImages from "./NatureImages";
import ObjectImages from "./ObjectImages";
import useCanvasStore from "../../stores/canvasStore";

export default function CreateBookFooter({
  activePanel,
  togglePanel,
  handleAddText,
  handleUpdateText,
  setBackgroundColor,
}) {

  const handleAddImage = useCanvasStore((state) => state.handleAddImage);
  const pages = useCanvasStore((state) => state.pages);

  // 最近使用した背景色を計算
  const recentColors = useMemo(() => {
    // ページをページ番号の降順にソート（新しい順）
    const sortedPages = [...pages].sort((a, b) => b.pageNumber - a.pageNumber);
    const colors = sortedPages.map((page) => page.backgroundColor);
    const uniqueColors = [];
    colors.forEach((color) => {
      if (!uniqueColors.includes(color)) {
        uniqueColors.push(color);
      }
    });
    return uniqueColors.slice(0, 5); // 最大5色保持
  }, [pages]);

  // 背景色を選択した際に履歴を更新
  const handleBackgroundColorChange = (color) => {
    setBackgroundColor(color);
    // 履歴はuseMemoで管理されるため、ここでは更新不要
  };

  // パネルごとのコンテンツを関数として定義
  const renderPanelContent = () => {
    switch (activePanel) {
      case "文字":
        return (
          <TextInputCanvas
            handleAddText={handleAddText}
            handleUpdateText={handleUpdateText}
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
          <div className="flex flex-col p-4 gap-4">
            <div className="flex items-center gap-2">
              <label>背景色を選択:</label>
              <input
                type="color"
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className="w-12 h-12"
              />
            </div>
            {recentColors.length > 0 && (
              <div className="flex items-center gap-2">
                <label>直近で使った色:</label>
                <div className="flex gap-2">
                  {recentColors.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 cursor-pointer border border-gray-300"
                      style={{ backgroundColor: color }}
                      onClick={() => handleBackgroundColorChange(color)} // クリックで再選択
                    ></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const handleImageSelect = (src) => {
    handleAddImage(src);
  };

  // Footer以外をクリックしたときに閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      const footerElement = document.querySelector("footer");
      const panelElement = document.querySelector(".fixed.left-0.bottom-0");

      // Footerとパネル以外をクリックした場合に閉じる
      if (
        footerElement &&
        !footerElement.contains(event.target) &&
        panelElement &&
        !panelElement.contains(event.target)
      ) {
        togglePanel(null);
      }
    };

    // イベントリスナーを追加
    document.addEventListener("click", handleClickOutside);

    // クリーンアップ
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [togglePanel]);

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

"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { FaTree, FaUser, FaBriefcase } from "react-icons/fa";
import { MdFormatColorFill, MdOutlineTextFields } from "react-icons/md";
import TextInputCanvas from "./TextInputCanvas";
import PeopleImages from "./PeopleImages";
import NatureImages from "./NatureImages";
import ObjectImages from "./ObjectImages";
import useCanvasStore from "../../stores/canvasStore";
import useIsMobile from "@/hooks/useIsMobile";
import Sidebar from "./Sidebar";
export default function CreateBookFooter({
  activePanel,
  togglePanel,
  handleAddText,
  handleUpdateText,
  setBackgroundColor,
}) {
  const handleAddImage = useCanvasStore((state) => state.handleAddImage);
  const pages = useCanvasStore((state) => state.pages);
  const isMobile = useIsMobile(); // デバイス判定

  // Refs の作成
  const panelRef = useRef(null);
  const sidebarRef = useRef(null);
  const footerRef = useRef(null);

  // 最近使用した背景色を計算
  const recentColors = useMemo(() => {
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
              <div className="flex flex-col gap-2">
                <label>使った色:</label>
                <div className="flex gap-2 flex-wrap">
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

  // FooterまたはSidebar以外をクリックしたときに閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activePanel) {
        if (isMobile) {
          // モバイルの場合、フッターとパネル以外をクリック
          if (
            footerRef.current &&
            !footerRef.current.contains(event.target) &&
            panelRef.current &&
            !panelRef.current.contains(event.target)
          ) {
            togglePanel(null);
          }
        } else {
          // デスクトップ/タブレットの場合、サイドバーとパネル以外をクリック
          if (
            sidebarRef.current &&
            !sidebarRef.current.contains(event.target) &&
            panelRef.current &&
            !panelRef.current.contains(event.target)
          ) {
            togglePanel(null);
          }
        }
      }
    };

    // イベントリスナーを追加
    document.addEventListener("click", handleClickOutside);

    // クリーンアップ
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [togglePanel, isMobile, activePanel]);

  return (
    <>
      {activePanel && (
        <div
          ref={panelRef} // パネルに ref を割り当て
          className={`fixed shadow-lg p-4 transition-transform duration-300 bg-white bg-opacity-50 ${
            isMobile
              ? `left-0 bottom-24 w-full h-1/4 transform ${
                  activePanel ? "translate-y-0" : "translate-y-full"
                }`
              : `top-20 left-20 w-1/4 h-full transform ${
                  activePanel ? "translate-x-0" : "-translate-x-full"
                }`
          }`}
          style={{ zIndex: 50 }} // サイドバーより上に表示
        >
          <h2 className="text-lg font-bold mb-4">{activePanel}を選ぶ</h2>
          {renderPanelContent()}
        </div>
      )}

      {/* スマートフォンの場合、フッターとして表示 */}
      {isMobile ? (
        <footer
          ref={footerRef} // フッターに ref を割り当て
          className="flex justify-center gap-4 p-4 text-bodyText text-sm bg-white bg-opacity-80 fixed bottom-0 w-full shadow-inner"
        >
          <button
            onClick={() => togglePanel("人物")}
            className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-gray-200"
            aria-label="人物パネルを開く"
          >
            <FaUser size={24} className="text-icon" />
            <span>人物</span>
          </button>
          <button
            onClick={() => togglePanel("自然")}
            className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-gray-200"
            aria-label="自然パネルを開く"
          >
            <FaTree size={24} className="text-icon" />
            <span>自然</span>
          </button>
          <button
            onClick={() => togglePanel("もの")}
            className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-gray-200"
            aria-label="ものパネルを開く"
          >
            <FaBriefcase size={24} className="text-icon" />
            <span>もの</span>
          </button>
          <button
            onClick={() => togglePanel("文字")}
            className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-gray-200"
            aria-label="文字パネルを開く"
          >
            <MdOutlineTextFields size={24} className="text-icon" />
            <span>文字</span>
          </button>
          <button
            onClick={() => togglePanel("背景色")}
            className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-gray-200"
            aria-label="背景色パネルを開く"
          >
            <MdFormatColorFill size={24} className="text-icon" />
            <span>背景</span>
          </button>
        </footer>
      ) : (
        // PC/タブレットの場合、サイドバーとして表示
        <Sidebar ref={sidebarRef}> {/* サイドバーに ref を割り当て */}
          <div className="flex flex-col items-start gap-4">
            <button
              onClick={() => togglePanel("人物")}
              className="flex flex-col items-start w-full gap-2 p-2 rounded-md hover:bg-gray-200"
              aria-label="人物パネルを開く"
            >
              <FaUser size={32} className="text-icon" />
              <span>人物</span>
            </button>
            <button
              onClick={() => togglePanel("自然")}
              className="flex flex-col items-start w-full gap-2 p-2 rounded-md hover:bg-gray-200"
              aria-label="自然パネルを開く"
            >
              <FaTree size={32} className="text-icon" />
              <span>自然</span>
            </button>
            <button
              onClick={() => togglePanel("もの")}
              className="flex flex-col items-start w-full gap-2 p-2 rounded-md hover:bg-gray-200"
              aria-label="ものパネルを開く"
            >
              <FaBriefcase size={32} className="text-icon" />
              <span>もの</span>
            </button>
            <button
              onClick={() => togglePanel("文字")}
              className="flex flex-col items-start w-full gap-2 p-2 rounded-md hover:bg-gray-200"
              aria-label="文字パネルを開く"
            >
              <MdOutlineTextFields size={32} className="text-icon" />
              <span>文字</span>
            </button>
            <button
              onClick={() => togglePanel("背景色")}
              className="flex flex-col items-start w-full gap-2 p-2 rounded-md hover:bg-gray-200"
              aria-label="背景色パネルを開く"
            >
              <MdFormatColorFill size={32} className="text-icon" />
              <span>背景</span>
            </button>
          </div>
        </Sidebar>
      )}
    </>
  );
}

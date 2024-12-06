"use client";

import React, { useMemo } from "react";
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
        return <NatureImages onImageSelect={(src) => handleImageSelect(src, '自然')} />;
      case "人物":
        return <PeopleImages onImageSelect={(src) => handleImageSelect(src, '人物')} />;
      case "もの":
        return <ObjectImages onImageSelect={(src) => handleImageSelect(src, 'もの')} />;
      case "背景色":
        return (
          <div className="flex flex-col p-4 gap-4 overflow-y-scroll max-h-[125px] md:max-h-[800px] lg:max-h-[1000px]">
            <div className="flex items-center gap-2">
              <label>背景色を選択:</label>
              <input
                type="color"
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className="w-12 h-12 cursor-pointer"
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

  const handleImageSelect = (src, category) => {
    handleAddImage(src, category);
  };

  // アイコンデータ
  const iconData = [
    { name: "人物", icon: <FaUser size={isMobile ? 24 : 32} />, panel: "人物" },
    { name: "自然", icon: <FaTree size={isMobile ? 24 : 32} />, panel: "自然" },
    { name: "もの", icon: <FaBriefcase size={isMobile ? 24 : 32} />, panel: "もの" },
    { name: "文字", icon: <MdOutlineTextFields size={isMobile ? 24 : 32} />, panel: "文字" },
    { name: "背景", icon: <MdFormatColorFill size={isMobile ? 24 : 32} />, panel: "背景色" },
  ];

  const renderIcons = () => {
    return iconData.map((item, index) => (
      <button
        key={index}
        onClick={() => togglePanel(item.panel)}
        className="flex flex-col items-start gap-1 p-2 rounded-md hover:bg-gray-200"
        aria-label={`${item.name}パネルを開く`}
      >
        {item.icon}
        <span>{item.name}</span>
      </button>
    ));
  };

  return (
    <>
      {activePanel && (
        <div
          className={`fixed shadow-lg p-4 transition-transform duration-300 bg-white bg-opacity-50 ${
            isMobile
              ? `left-0 bottom-24 w-full h-1/4 transform ${
                  activePanel ? "translate-y-0" : "translate-y-full"
                }`
              : `top-20 left-20 w-1/4 h-full transform ${
                  activePanel ? "translate-x-0" : "-translate-x-full"
                }`
          }`}
          style={{ zIndex: 50 }}
        >
          <h2 className="text-lg font-bold mb-4">{activePanel}を選ぶ</h2>
          {renderPanelContent()}
        </div>
      )}

      {isMobile ? (
        <footer
          className="flex justify-center gap-4 p-4 text-bodyText text-sm bg-white bg-opacity-80 fixed bottom-0 w-full shadow-inner"
        >
          {renderIcons()}
        </footer>
      ) : (
        <Sidebar>
          <div className="flex flex-col items-start gap-4">{renderIcons()}</div>
        </Sidebar>
      )}
    </>
  );
}

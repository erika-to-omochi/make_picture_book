import React, { useState } from "react";
import { FaTshirt } from "react-icons/fa";
import { GiUnderwearShorts, GiLips } from "react-icons/gi";
import { PiHairDryer } from "react-icons/pi";
import { RiEyeCloseLine } from "react-icons/ri";

export default function HumanImageSelector() {
  // 項目名を設定（日本語ラベルと英語キーのペア）
  const categories = [
    { key: "hair", count: 3, icon: <PiHairDryer /> },
    { key: "eye", count: 5, icon: <RiEyeCloseLine /> },
    { key: "mouth", count: 5, icon: <GiLips /> },
    { key: "topwear", count: 5, icon: <FaTshirt /> },
    { key: "bottomwear", count: 5, icon: <GiUnderwearShorts /> },
  ];

  // 現在選択中のカテゴリ
  const [selectedCategory, setSelectedCategory] = useState("hair");

  // 各カテゴリで選択された画像の状態を管理
  const [selectedImages, setSelectedImages] = useState({});

  // 選択されたカテゴリの画像リストを生成
  const getImageList = () => {
    if (!selectedCategory) return [];
    const category = categories.find((cat) => cat.key === selectedCategory);
    if (!category) return [];
    return Array.from(
      { length: category.count },
      (_, i) => `/human/childe/${selectedCategory}/${i + 1}.png`
    );
  };

  // プレビューエリアの要素を生成
  const renderPreview = () => {
    return (
      <>
        {/* ベース画像を最初に表示 */}
        <img
          key="base"
          src="/human/childe/base.png"
          alt="Base preview"
          className="absolute w-full h-full"
        />
        {/* カテゴリごとの選択済み画像を表示 */}
        {categories.map(({ key }) => {
          if (!selectedImages[key]) return null; // 選択されていない場合はスキップ

          return (
            <img
              key={key}
              src={selectedImages[key]}
              alt={`${key} preview`}
              className={`absolute ${getPreviewStyle(key)}`} // 各パーツの位置スタイルを追加
            />
          );
        })}
      </>
    );
  };

  // プレビューエリアに表示するスタイル（カテゴリごとの位置調整）
  const getPreviewStyle = (category) => {
    const styles = {
    };
    return styles[category] || "";
  };

  return (
    <div className="p-4">
      {/* プレビューエリア */}
      <div className="relative w-64 h-64 border bg-white mx-auto mb-8">
        {renderPreview()}
      </div>

      {/* カテゴリーの選択 */}
      <div className="flex gap-4 justify-center mb-8">
        {categories.map(({ key,icon }) => (
          <button
            key={key}
            className={`px-4 py-2 rounded flex items-center justify-center gap-2 transition-transform duration-200 group ${
              selectedCategory === key
                ? "bg-background"
                : "border-background"
            }`}
            onClick={() => setSelectedCategory(key)} // カテゴリ変更
          >
            <span className="transform transition-transform duration-200 group-hover:-translate-y-1">
              {icon}
            </span>
          </button>
        ))}
      </div>


      {/* 選択肢を表示 */}
      {selectedCategory && (
        <div className="flex flex-wrap gap-4 justify-center">
          {getImageList().map((imagePath, index) => (
            <div
              key={index}
              className="w-24 h-24 border border-background rounded overflow-hidden"
            >
              <img
                src={imagePath}
                alt={`${selectedCategory} option ${index + 1}`}
                className="w-full h-full object-contain cursor-pointer hover:opacity-75"
                onClick={() =>
                  setSelectedImages((prev) => ({
                    ...prev,
                    [selectedCategory]: imagePath,
                  }))
                } // 選択時に選択状態を更新
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

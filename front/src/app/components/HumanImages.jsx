import React, { useState } from "react";
import { FaTshirt } from "react-icons/fa";
import { GiUnderwearShorts, GiLips } from "react-icons/gi";
import { PiHairDryer } from "react-icons/pi";
import { RiEyeCloseLine } from "react-icons/ri";

export default function HumanImageSelector({ onImageSelect }) {
  const categories = [
    { key: "hair", count: 3, icon: <PiHairDryer /> },
    { key: "eye", count: 5, icon: <RiEyeCloseLine /> },
    { key: "mouth", count: 5, icon: <GiLips /> },
    { key: "topwear", count: 15, icon: <FaTshirt /> },
    { key: "bottomwear", count: 15, icon: <GiUnderwearShorts /> },
  ];

  const [selectedCategory, setSelectedCategory] = useState("hair");
  const [selectedImages, setSelectedImages] = useState({});

  const getImageList = () => {
    if (!selectedCategory) return [];
    const category = categories.find((cat) => cat.key === selectedCategory);
    if (!category) return [];
    return Array.from(
      { length: category.count },
      (_, i) => `/human/childe/${selectedCategory}/${i + 1}.png`
    );
  };

  const getPreviewStyle = (category) => {
    const styles = {
    };
    return styles[category] || "";
  };

  const handlePreviewClick = () => {
    const baseImagePath = "/human/childe/base.png";
    const parts = [
      { src: baseImagePath },
      ...Object.entries(selectedImages).map(([category, imagePath]) => ({
        src: imagePath
      }))
    ];
    if (onImageSelect) {
      onImageSelect(parts);
    }
  };

  const handleThumbnailClick = (imagePath) => {
    setSelectedImages((prev) => ({
      ...prev,
      [selectedCategory]: imagePath,
    }));
  };

  const renderPreview = () => (
    <>
      <img
        key="base"
        src="/human/childe/base.png"
        alt="Base preview"
        className="absolute w-full h-full"
      />
      {categories.map(({ key }) => {
        const imagePath = selectedImages[key];
        if (!imagePath) return null;
        return (
          <img
            key={key}
            src={imagePath}
            alt={`${key} preview`}
            className={`absolute ${getPreviewStyle(key)}`}
          />
        );
      })}
    </>
  );

  return (
    <div className="p-4">
      {/* プレビューエリア */}
      <div
        className="relative w-64 h-64 border bg-background mx-auto mb-8 cursor-pointer hover:opacity-75 hover:-translate-y-1"
        onClick={handlePreviewClick} // プレビューエリアクリック時の処理
      >
        {renderPreview()}
      </div>

      {/* カテゴリー選択 */}
      <div className="flex gap-4 justify-center mb-8">
        {categories.map(({ key, icon }) => (
          <button
            key={key}
            className={`px-4 py-2 rounded flex items-center justify-center gap-2 transition-transform duration-200 group ${
              selectedCategory === key ? "bg-background" : "border-background"
            }`}
            onClick={() => setSelectedCategory(key)}
          >
            <span className="transform transition-transform duration-200 group-hover:-translate-y-1">
              {icon}
            </span>
          </button>
        ))}
      </div>

      {/* サムネイル選択 */}
      <div className="flex flex-wrap gap-4 justify-center overflow-y-auto max-h-80">
        {getImageList().map((imagePath, index) => (
          <div
            key={index}
            className="w-24 h-24 border bg-background rounded overflow-hidden cursor-pointer"
            onClick={() => handleThumbnailClick(imagePath)} // サムネイルクリック
          >
            <img
              src={imagePath}
              alt={`${selectedCategory} option ${index + 1}`}
              className="w-full h-full object-contain hover:opacity-75"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

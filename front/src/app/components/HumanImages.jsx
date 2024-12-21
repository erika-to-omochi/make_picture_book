import React, { useState } from "react";
import { FaTshirt } from "react-icons/fa";
import { GiUnderwearShorts, GiLips } from "react-icons/gi";
import { PiHairDryer } from "react-icons/pi";
import { RiEyeCloseLine } from "react-icons/ri";

function CharacterImageSelector({ onImageSelect, characterType }) {
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
      (_, i) => `/human/${characterType}/${selectedCategory}/${i + 1}.png`
    );
  };

  const getPreviewStyle = (category) => {
    const styles = {};
    return styles[category] || "";
  };

  const handlePreviewClick = () => {
    const baseImagePath = `/human/${characterType}/base.png`;
    const parts = [
      { src: baseImagePath },
      ...Object.entries(selectedImages).map(([category, imagePath]) => ({
        src: imagePath,
      })),
    ];
    if (onImageSelect) {
      onImageSelect(parts, characterType);
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
        src={`/human/${characterType}/base.png`}
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
    <div className="p-4 overflow-y-scroll max-h-[125px] md:max-h-[500px] lg:max-h-[800px]">
      {/* プレビューエリア */}
      <div
        className="relative border bg-background mx-auto mb-8 cursor-pointer hover:opacity-75 hover:-translate-y-1
        w-full max-w-[80%] aspect-square sm:max-w-[90%] lg:max-w-[100%]"
        onClick={handlePreviewClick}
      >
        {renderPreview()}
      </div>

      {/* カテゴリー選択 */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
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
      <div className="flex flex-wrap gap-2 justify-center overflow-y-auto max-h-64">
        {getImageList().map((imagePath, index) => (
          <div
            key={index}
            className="w-24 h-24 border bg-background rounded overflow-hidden cursor-pointer"
            onClick={() => handleThumbnailClick(imagePath)}
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

export default function HumanImageSelector({ onImageSelect }) {
  const [activeTab, setActiveTab] = useState("child");

  return (
    <div>
      {/* タブ切り替え */}
      <div className="flex gap-4 justify-center mb-2">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "child" ? "bg-customButton text-white" : "bg-gray-300"
          }`}
          onClick={() => setActiveTab("child")}
        >
          子ども
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "adult" ? "bg-customButton text-white" : "bg-gray-300"
          }`}
          onClick={() => setActiveTab("adult")}
        >
          大人
        </button>
      </div>

      {/* キャラクターセレクター */}
      {activeTab === "child" && (
        <CharacterImageSelector
          onImageSelect={onImageSelect}
          characterType="childe"
        />
      )}
      {activeTab === "adult" && (
        <CharacterImageSelector
          onImageSelect={onImageSelect}
          characterType="adult"
        />
      )}
    </div>
  );
}

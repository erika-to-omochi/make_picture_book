"use client";

import Image from "next/image";

export default function NatureImages({ onImageSelect }) {
  // 最初の1〜10の画像パス
  const images1 = Array.from({ length: 10 }, (_, i) => `/object/${i + 1}.png`);
  // 56〜80の画像パス
  const images2 = Array.from({ length: 25 }, (_, i) => `/object/${i + 56}.png`);

  // 配列を結合
  const allImages = [...images1, ...images2];

  return (
    <div className="grid grid-cols-8 md:grid-cols-3 gap-2 overflow-y-scroll max-h-[125px] md:max-h-[500px] lg:max-h-[800px]">
      {allImages.map((src, index) => (
        <div key={index} className="w-20 h-20 flex items-center justify-center">
          <Image
            src={src}
            alt={`Object ${index + 1}`}
            width={48}
            height={48}
            className="cursor-pointer"
            onClick={() => {
              onImageSelect && onImageSelect(src, "自然"); // カテゴリを渡す
            }}
          />
        </div>
      ))}
    </div>
  );
}

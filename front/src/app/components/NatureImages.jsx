"use client";

import Image from "next/image";

export default function NatureImages({ onImageSelect }) {
  const images = Array.from({ length: 10 }, (_, i) => `/object/${i + 1}.png`);

  return (
    <div
      className="grid grid-cols-8 md:grid-cols-3 gap-2 overflow-y-scroll max-h-[125px] md:max-h-[800px] lg:max-h-[700px]"
    >
      {images.map((src, index) => (
        <div key={index} className="w-20 h-20 flex items-center justify-center">
          <Image
            src={src}
            alt={`Person ${index + 1}`}
            width={48}
            height={48}
            className="cursor-pointer"
            onClick={() => {
              console.log("Image clicked:", src);
              onImageSelect && onImageSelect(src, "自然"); // カテゴリを渡す
            }}
          />
        </div>
      ))}
    </div>
  );
}

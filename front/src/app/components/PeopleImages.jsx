"use client";

import Image from "next/image";

export default function PeopleImages({ onImageSelect }) {
  const images = Array.from({ length: 46 }, (_, i) => `/people/${i + 1}.png`);

  return (
    <div
      className="grid grid-cols-8 md:grid-cols-3 gap-2 overflow-y-scroll max-h-[125px] md:max-h-[800px] lg:max-h-[1000px]"
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
              onImageSelect && onImageSelect(src, "人物");
            }}
          />
        </div>
      ))}
    </div>
  );
}

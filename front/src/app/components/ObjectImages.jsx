"use client";

import Image from "next/image";

export default function ObjectImages({ onImageSelect }) {
  const images = Array.from({ length: 12 }, (_, i) => `/object/${i + 10}.png`);

  return (
    <div
      className="grid grid-cols-8 gap-4 overflow-y-scroll"
      style={{ maxHeight: '250px' }}
    >
      {images.map((src, index) => (
        <div key={index} className="w-20 h-20 flex items-center justify-center">
          <Image
            src={src}
            alt={`Person ${index + 1}`}
            width={48}
            height={48}
            onClick={() => onImageSelect && onImageSelect(src)}
          />
        </div>
      ))}
    </div>
  );
}

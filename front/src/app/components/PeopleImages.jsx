"use client";

import Image from "next/image";

export default function PeopleImages({ onImageSelect }) {
  const images = Array.from({ length: 46 }, (_, i) => `/people/${i + 1}.png`);

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
            onClick={() => {
              console.log("Image clicked:", src);
              onImageSelect && onImageSelect(src)
            }}
          />
        </div>
      ))}
    </div>
  );
}

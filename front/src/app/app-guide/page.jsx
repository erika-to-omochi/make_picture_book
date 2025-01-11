'use client';

import React from 'react';

const sections = [
  {
    title: '基本操作',
    src: 'https://i.gyazo.com/2300b7aebdcda944b06e6d4665fbe298.mp4',
    alt: '基本操作の動画',
  },
  {
    title: '「文字」について',
    src: 'https://i.gyazo.com/cf48a15a14be09806265b60210df2a31.mp4',
    alt: '文字についての動画',
  },
  {
    title: '「ひと」について',
    src: 'https://i.gyazo.com/073f659968f6b345721c72fa5097cec5.mp4',
    alt: 'ひとについての動画',
  },
];

export default function GuidePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 mb-24">
      {sections.map((section, index) => (
        <div key={index} className="max-w-3xl w-full bg-customBackground p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">
            {section.title}
          </h2>
          <div className="flex justify-center">
            <video
              src={section.src}
              controls
              className="w-full h-auto rounded-lg"
              title={section.alt}
            >
              お使いのブラウザは動画タグに対応していません。
            </video>
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';

import React from 'react';

const sections = [
  {
    title: '基本操作',
    src: 'https://gyazo.com/your-fourth-video-id', // 実際の動画URLに置き換えてください
    iframeTitle: '基本操作',
  },
  {
    title: '「文字」について',
    src: 'https://gyazo.com/your-second-video-id', // 実際の動画URLに置き換えてください
    iframeTitle: '文字について',
  },
  {
    title: '「ひと」について',
    src: 'https://gyazo.com/your-third-video-id', // 実際の動画URLに置き換えてください
    iframeTitle: 'ひとについて',
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
            <iframe
              src={section.src}
              className="w-full h-64 md:h-96 rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={section.iframeTitle}
            ></iframe>
          </div>
        </div>
      ))}
    </div>
  );
}

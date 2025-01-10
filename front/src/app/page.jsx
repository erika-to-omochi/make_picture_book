'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

function BookCard({ title, imageSrc, altText, additionalInfo, path }) {
  const router = useRouter();

  const handleClick = () => {
    if (path) {
      router.push(path);
    }
  };

  // アニメーションのバリエーションを定義
  const cardVariants = {
    offscreen: {
      opacity: 0,
      y: 50,
    },
    onscreen: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.2,
        duration: 0.8
      }
    }
  };

  return (
    <motion.div
      className="card shadow-xl p-2 mb-2 cursor-pointer w-80 bg-customBackground"
      onClick={handleClick}
      initial="offscreen"
      animate="onscreen"
      variants={cardVariants}
      whileHover={{ scale: 1.05, boxShadow: '0px 15px 25px rgba(0, 0, 0, 0.3)' }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="card-body">
        <h2 className="card-title text-lg font-semibold text-heading text-center">{title}</h2>
        <img
          src={imageSrc}
          alt={altText}
          className="rounded-lg object-cover w-full h-56 mb-2"
        />
        <p className="text-sm text-bodyText whitespace-pre-line text-center">{additionalInfo}</p>
      </div>
    </motion.div>
  );
}

export default function Page() {
  return (
    <div className="app min-h-screen p-4 mb-8 max-w-6xl mx-auto">

      {/* どんなアプリ？のカスタムセクション */}
      <div className="custom-section w-full mx-auto mb-8 p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-8 text-center text-heading">絵本がぽんっとは？</h1>
        <p className="text-lg text-bodyText text-center">
          このアプリは誰でも気軽にオリジナルの絵本を作れるプラットフォームです！<br />
          言葉だけでは伝わりにくいことや、伝えにくい気持ちを絵本にしてみてはどうでしょうか？
        </p>
      </div>

      {/* BookCard セクション */}
      <div className="book-section grid gap-8 mx-auto mb-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
        <BookCard
          title="絵本を見てみる"
          imageSrc="home/look.png"
          altText="Library"
          additionalInfo={`今までに作られた絵本を\n見ることができます。`}
          path="/index-books"
        />
        <BookCard
          title="絵本を作ってみる"
          imageSrc="home/make.png"
          altText="Create Library"
          additionalInfo={`オリジナルの絵本を作れます。\n作成にはログインが必要です。`}
          path="/create-book"
        />
        <BookCard
          title="絵本の作り方"
          imageSrc="home/detail.png"
          altText="How to Create"
          additionalInfo={`絵本の作り方について\n詳細の説明を動画で見れます。`}
          path="/app-guide"
        />
      </div>
    </div>
  );
}

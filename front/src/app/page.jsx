import React from 'react';
import BookCard from './components/BookCard';
import TutorialButton from './components/TutorialButton';
import { FaBook, FaEdit, FaPrint, FaInfoCircle } from 'react-icons/fa';

function App() {
  return (
    <div className="app min-h-screen p-6 mb-8">
      <BookCard
          title="どんなアプリ？"
          description="オリジナルの絵本を作ったり、見ることができます！"
          imageSrc="home/top.jpg"
          altText="Library"
          additionalInfo="チュートリアルから詳細が見れます"
      />

      {/* チュートリアルセクション */}
      <div
        className="tutorial-section p-6 rounded-lg shadow-md max-w-md mx-auto m-8"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
      >
        <div className="flex items-center mb-2">
          <h2 className="text-2xl font-bold text-heading">チュートリアル</h2>
          <FaInfoCircle size={32} className="ml-2 text-icon" />
        </div>
        <p className="text-sm text-bodyText mb-4">再生して使い方を見る</p>
        <TutorialButton
          icon={<FaBook className="text-icon" />}
          title="絵本の見方"
          description="再生ボタンを押す"
        />
        <TutorialButton
          icon={<FaEdit className="text-icon" />}
          title="絵本の作り方"
          description="再生ボタンを押す"
        />
        <TutorialButton
          icon={<FaEdit className="text-icon" />}
          title="絵本の編集の仕方"
          description="再生ボタンを押す"
        />
        <TutorialButton
          icon={<FaPrint className="text-icon" />}
          title="絵本の印刷の仕方"
          description="再生ボタンを押す"
        />
      </div>

      {/* BookCardセクション */}
      <div className="book-section grid gap-6 max-w-md mx-auto mb-8">
        <BookCard
          title="絵本を見てみる"
          description="今までに作られた絵本を見ることができます！"
          imageSrc="home/index.jpg"
          altText="Library"
          additionalInfo="この画面をクリックすると絵本の一覧が見れます"
        />
        <BookCard
          title="絵本を作ってみる"
          description="オリジナルの絵本を作ってみましょう！"
          imageSrc="home/make.jpg"
          altText="Create Library"
          additionalInfo="絵本作成にはユーザー登録が必要です"
        />
      </div>
    </div>
  );
}

export default App;

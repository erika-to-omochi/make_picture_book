import React from 'react';
import BookCard from './components/BookCard';
import TutorialButton from './components/TutorialButton';
import { FaBookOpen, FaPlus, FaEdit, FaPrint } from 'react-icons/fa';

function App() {
  return (
    <div className="app min-h-screen p-6">
      <BookCard
          title="どんなアプリ？"
          description="オリジナルの絵本を作ったり、見ることができます！"
          imageSrc="home/top.jpg"
          altText="Library"
          additionalInfo="チュートリアルから詳細が見れます"
      />
      {/* チュートリアルセクション */}
      <div
      className="tutorial-section p-6 rounded-lg shadow-md max-w-md mx-auto mb-8"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">チュートリアル</h2>
        <p className="text-sm text-gray-500 mb-4">再生して使い方を見る</p>
        <TutorialButton
          icon={<FaBookOpen />}
          title="絵本の見方"
          description="再生ボタンを押す"
        />
        <TutorialButton
          icon={<FaPlus />}
          title="絵本の作り方"
          description="再生ボタンを押す"
        />
        <TutorialButton
          icon={<FaEdit />}
          title="絵本の編集の仕方"
          description="再生ボタンを押す"
        />
        <TutorialButton
          icon={<FaPrint />}
          title="絵本の印刷の仕方"
          description="再生ボタンを押す"
        />
      </div>

      {/* BookCardセクション */}
      <div className="book-section grid gap-6 max-w-md mx-auto">
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

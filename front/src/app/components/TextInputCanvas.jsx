import React, { useState, useEffect } from 'react';
import useCanvasStore from '../../stores/canvasStore';

function TextInputCanvas({}) {
  const {
    selectedTextIndex,
    pages,
    currentPageIndex,
    handleAddText,
    handleUpdateText,
  } = useCanvasStore();

  const [inputText, setInputText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState('#000000');

  // 現在のページから選択されたテキスト情報を取得
  const selectedText = selectedTextIndex !== null
  ? pages[currentPageIndex]?.pageElements[selectedTextIndex]
  : null;

  useEffect(() => {
    if (selectedText) {
      setInputText(selectedText.text);
      setFontSize(selectedText.fontSize);
      setFontColor(selectedText.fontColor);
    } else {
      setInputText('');
      setFontSize(24);
      setFontColor('#000000');
    }
  }, [selectedText]);

  const handleButtonClick = () => {
    if (inputText.trim()) {
      if (selectedText) {
        handleUpdateText(selectedTextIndex, { text: inputText, fontSize, fontColor });
      } else {
        handleAddText({ text: inputText, fontSize, fontColor });
      }
      setInputText('');
      setFontSize(24);
      setFontColor('#000000');
    }
  };

  return (
    <div className="grid overflow-y-scroll max-h-[250px] md:max-h-[800px] lg:max-h-[1000px]">
      <div className="flex flex-wrap lg:flex-col lg:gap-4 lg:items-start">
        {/* 入力フィールド */}
        <div className="w-full mb-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="テキストを入力"
            className="border p-2 w-full"
          />
        </div>

        {/* サイズ選択フィールド */}
        <div className="w-full flex items-center gap-2 mb-4">
          <label className="whitespace-nowrap">サイズ : </label>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            placeholder="フォントサイズ"
            className="border p-2"
            style={{ width: '80px' }} // 必要に応じてサイズ調整
          />
        </div>

        {/* 文字色選択フィールド */}
        <div className="w-full flex items-center gap-2 mb-4">
          <label>文字色 : </label>
          <input
            type="color"
            value={fontColor}
            onChange={(e) => setFontColor(e.target.value)}
            className="w-12 h-12"
          />
        </div>

        {/* ボタン */}
        <div className="w-full">
          <button
            onClick={handleButtonClick}
            className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80"
            style={{ width: '80px' }}
          >
            {selectedText ? '更新' : '追加'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TextInputCanvas;

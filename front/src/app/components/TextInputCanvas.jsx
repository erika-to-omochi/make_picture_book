// TextInputCanvas.jsx
'use client';

import React, { useState, useEffect } from 'react';
import useCanvasStore from '../../stores/canvasStore';

function TextInputCanvas() {
  const {
    selectedTextIndex,
    pages,
    currentPageIndex,
    handleAddText,
    handleUpdateText,
  } = useCanvasStore();

  const [inputText, setInputText] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [fontColor, setFontColor] = useState('#000000');

  // 現在のページから選択されたテキスト情報を取得
  const selectedText = selectedTextIndex !== null
    ? pages[currentPageIndex]?.pageElements[selectedTextIndex]
    : null;

  // selectedText が変更されたときにローカルステートを更新
  useEffect(() => {
    if (selectedText) {
      if (inputText !== selectedText.text) {
        setInputText(selectedText.text);
      }
      if (fontSize !== selectedText.fontSize) {
        setFontSize(selectedText.fontSize);
      }
      if (fontColor !== selectedText.fontColor) {
        setFontColor(selectedText.fontColor);
      }
    } else {
      if (inputText !== '') {
        setInputText('');
      }
      if (fontSize !== 32) {
        setFontSize(32);
      }
      if (fontColor !== '#000000') {
        setFontColor('#000000');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedText]); // 依存関係を selectedText のみに限定

  // 入力フィールドの変更ハンドラー
  const handleInputChange = (e) => {
    const newText = e.target.value;
    setInputText(newText);
    if (selectedTextIndex !== null) {
      handleUpdateText(selectedTextIndex, { text: newText });
    }
  };

  // フォントサイズ変更のハンドラー
  const handleFontSizeChange = (e) => {
    const newFontSize = Number(e.target.value);
    setFontSize(newFontSize);
    if (selectedTextIndex !== null) {
      handleUpdateText(selectedTextIndex, { fontSize: newFontSize });
    }
  };

  // フォントカラー変更のハンドラー
  const handleFontColorChange = (e) => {
    const newFontColor = e.target.value;
    setFontColor(newFontColor);
    if (selectedTextIndex !== null) {
      handleUpdateText(selectedTextIndex, { fontColor: newFontColor });
    }
  };

  // 追加ボタンのクリックハンドラー
  const handleButtonClick = () => {
    if (inputText.trim()) {
      if (selectedText) {
        handleUpdateText(selectedTextIndex, { text: inputText, fontSize, fontColor });
      } else {
        handleAddText({ text: inputText, fontSize, fontColor });
      }
      setInputText('');
      setFontSize(32);
      setFontColor('#000000');
    }
  };

  return (
    <div className="grid overflow-y-scroll max-h-[125px] md:max-h-[800px] lg:max-h-[1000px]">
      <div className="flex flex-wrap lg:flex-col lg:gap-4 lg:items-start">
        {/* 入力フィールド */}
        <div className="w-full mb-4">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="テキストを入力"
            className="border p-2 w-full"
          />
        </div>

        {/* サイズ選択フィールド */}
        <div className="w-full flex items-center gap-2">
          <label className="whitespace-nowrap">サイズ : </label>
          <input
            type="number"
            value={fontSize}
            onChange={handleFontSizeChange}
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
            onChange={handleFontColorChange}
            className="w-12 h-12"
          />
        </div>

        {/* ボタン（オプション） */}
        {selectedTextIndex === null && (
          <div className="w-full">
            <button
              onClick={handleButtonClick}
              className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80"
              style={{ width: '80px' }}
            >
              追加
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TextInputCanvas;

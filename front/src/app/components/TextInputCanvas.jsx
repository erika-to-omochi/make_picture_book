import React, { useState, useEffect } from 'react';

function TextInputCanvas({ onAddText, onUpdateText, selectedText }) {
  const [inputText, setInputText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    if (selectedText) {
      setInputText(selectedText.text);
      setFontSize(selectedText.fontSize);
      setColor(selectedText.color);
    } else {
      setInputText('');
      setFontSize(24);
      setColor('#000000');
    }
  }, [selectedText]);

  const handleButtonClick = () => {
    if (inputText.trim()) {
      if (selectedText) {
        onUpdateText({ text: inputText, fontSize, color });
      } else {
        onAddText({ text: inputText, fontSize, color });
      }
      setInputText('');
      setFontSize(24);
      setColor('#000000');
    }
  };

  return (
    <div
      className="text-input-canvas overflow-y-scroll"
      style={{ maxHeight: '250px' }}
    >
      <div className="flex flex-wrap">
        <div className="w-full pr-2 mb-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="テキストを入力"
            className="border p-2 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <label>サイズ:</label>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            placeholder="フォントサイズ"
            className="border p-2 mr-4"
            style={{ width: '20%' }}
          />
          <div className="flex items-center p-4 gap-2">
            <label>文字色:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-12"
            />
          </div>
          <button
            onClick={handleButtonClick}
            className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80 ml-4"
            style={{ width: '20' }}
          >
            {selectedText ? 'テキストを更新' : 'キャンバスに追加'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TextInputCanvas;

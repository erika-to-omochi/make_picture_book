import React, { useState } from 'react';

function TextInputCanvas({ onAddText }) {
  const [inputText, setInputText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#000000');

  const handleAddButtonClick = () => {
    if (inputText.trim()) {
      onAddText({ text: inputText, fontSize, color });
      setInputText('');
    }
  };

  return (
    <div className="text-input-canvas">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="テキストを入力"
        className="border p-2 w-full"
      />
      <input
        type="number"
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
        placeholder="フォントサイズ"
        className="border p-2 w-full mt-2"
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="border p-2 w-full mt-2"
      />
      <button onClick={handleAddButtonClick} className="mt-2 p-2 bg-customButton text-white rounded-md hover:bg-opacity-80">
        キャンバスに追加
      </button>
    </div>
  );
}

export default TextInputCanvas;
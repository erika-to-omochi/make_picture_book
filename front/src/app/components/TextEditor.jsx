import React, { useState } from 'react';
import TextInputCanvas from './TextInputCanvas';
import Canvas from './Canvas';

function TextEditor() {
  const [texts, setTexts] = useState([]);
  const [selectedTextIndex, setSelectedTextIndex] = useState(null);

  const handleAddText = (newText) => {
    setTexts([...texts, newText]);
  };

  // テキストが選択されたときの処理
  const handleSelectText = (index) => {
    setSelectedTextIndex(index);
  };

  // テキストのプロパティを更新する処理
  const handleUpdateText = (updatedText) => {
    if (selectedTextIndex !== null) {
      const updatedTexts = [...texts];
      updatedTexts[selectedTextIndex] = updatedText;
      setTexts(updatedTexts);
    }
  };

  return (
    <div className="text-editor">
      <TextInputCanvas
        onAddText={handleAddText}
        onUpdateText={handleUpdateText}
        selectedText={selectedTextIndex !== null ? texts[selectedTextIndex] : null}
      />
      <Canvas
        texts={texts}
        onSelectText={handleSelectText}
      />
    </div>
  );
}

export default TextEditor;

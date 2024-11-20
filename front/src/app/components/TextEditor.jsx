import React from 'react';
import TextInputCanvas from './TextInputCanvas';
import Canvas from './Canvas';
import useCanvasStore from '../../stores/canvasStore';

function TextEditor() {
  const {
    pages,
    addPage,
    currentPageIndex,
    addText,
    updateText,
    selectedTextIndex,
    setSelectedTextIndex,
  } = useCanvasStore();

  const handleAddText = (newText) => {
    addText(newText); // ストアのaddTextアクションを呼び出す
  };

  const handleSelectText = (index) => {
    console.log("Text selected at index:", index);
    setSelectedTextIndex(index);
  };

  // テキストのプロパティを更新する処理
  const handleUpdateText = (updatedText) => {
    console.log("Updating text:", updatedText);
    if (selectedTextIndex !== null) {
      updateText(selectedTextIndex, updatedText); // ストアのupdateTextアクションを呼び出す
    }
  };

  // 現在のページのテキストを取得
  const currentPage = pages[currentPageIndex];
  const texts = currentPage ? currentPage.content.texts : [];

    // デバッグ用ログ
    useEffect(() => {
      console.log("TextEditor: currentPageIndex:", currentPageIndex);
      console.log("TextEditor: currentPage:", currentPage);
      console.log("TextEditor: texts:", texts);
    }, [currentPageIndex, texts, currentPage]);

  return (
    <div className="text-editor">
      <TextInputCanvas
        onAddText={handleAddText}
        onUpdateText={handleUpdateText}
        selectedText={selectedTextIndex !== null ? texts[selectedTextIndex] : null}
      />
      <Canvas
        handleAddPage={addPage}
      />
    </div>
  );
}

export default TextEditor;

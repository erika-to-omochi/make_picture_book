"use client";

import React, { useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Transformer } from 'react-konva';

function Canvas({ texts, onSelectText, onDeleteText, onUpdateText }) {
  const [selectedTextIndex, setSelectedTextIndex] = React.useState(null);
  const transformerRef = useRef(null);
  const stageRef = useRef(null);
  const textRefs = useRef([]);

  const stageWidth = typeof window !== "undefined" ? window.innerWidth * 0.8 : 800;
  const stageHeight = stageWidth * 0.75;

  useEffect(() => {
    if (selectedTextIndex !== null && transformerRef.current && textRefs.current[selectedTextIndex]) {
      transformerRef.current.nodes([textRefs.current[selectedTextIndex]]);
      transformerRef.current.getLayer().batchDraw();
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedTextIndex, texts]);

  // バックスペースキーで削除
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace' && selectedTextIndex !== null) {
        e.preventDefault();
        handleDeleteText(selectedTextIndex);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTextIndex]);

  const handleDragEnd = (index, e) => {
    onUpdateText(index, { x: e.target.x(), y: e.target.y() });
  };

  const handleTransformEnd = (index, e) => {
    const node = textRefs.current[index];
    const scaleY = node.scaleY();

    // 新しいフォントサイズを計算
    const newFontSize = Math.round(texts[index].fontSize * scaleY);

    // スケールをリセット
    node.scaleX(1);
    node.scaleY(1);

    // 回転角度を取得
    const rotation = node.rotation();

    // テキストの位置を取得
    const x = node.x();
    const y = node.y();

    // 更新されたプロパティを親に通知
    onUpdateText(index, {
      x,
      y,
      rotation,
      fontSize: newFontSize,
    });
  };

  const handleTextClick = (index) => {
    setSelectedTextIndex(index);
    onSelectText(index);
  };

  // 空白をクリックした際に選択解除
  const handleStageMouseDown = (e) => {
    // 背景のRectをクリックした場合
    if (e.target.name() === 'background') {
      setSelectedTextIndex(null);
      onSelectText(null);
    }
  };

  const handleDeleteText = (index) => {
    onDeleteText(index);
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      paddingTop: "20px",
    }}>
      <Stage
        ref={stageRef}
        width={typeof window !== "undefined" ? window.innerWidth * 0.9 : 800}
        height={typeof window !== "undefined" ? window.innerWidth * 0.6 : 600}
        onMouseDown={handleStageMouseDown} // Stage全体のクリックハンドラ
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={typeof window !== "undefined" ? window.innerWidth * 0.9 : 800}
            height={typeof window !== "undefined" ? window.innerWidth * 0.6 : 600}
            fill="white"
            onMouseDown={handleStageMouseDown} // 背景のクリックハンドラ
            name="background" // 背景を識別するための名前を付与
          />
          {texts.map((pos, index) => (
            <Text
              key={index}
              ref={(el) => (textRefs.current[index] = el)}
              text={pos.text}
              x={pos.x}
              y={pos.y}
              draggable
              onDragEnd={(e) => handleDragEnd(index, e)}
              onTransformEnd={(e) => handleTransformEnd(index, e)}
              fontSize={pos.fontSize}
              fill={pos.color}
              onClick={() => handleTextClick(index)}
              rotation={pos.rotation || 0}
              scaleX={1} // スケールを1に固定
              scaleY={1} // スケールを1に固定
            />
          ))}
          {selectedTextIndex !== null && (
            <Transformer
              ref={transformerRef}
              anchorSize={8}
              borderDash={[6, 2]}
              keepRatio={true}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export default Canvas;

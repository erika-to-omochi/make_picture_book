import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Stage, Layer, Rect, Text, Transformer } from 'react-konva';

function Canvas({ texts, onSelectText, onDeleteText, onUpdateText }) {
  const [selectedTextIndex, setSelectedTextIndex] = useState(null);
  const transformerRef = useRef(null);
  const stageRef = useRef(null);
  const textRefs = useRef([]);

  const stageWidth = typeof window !== "undefined" ? window.innerWidth * 0.8 : 800;
  const stageHeight = stageWidth * 0.75;

  // メモ化された handleDeleteText
  const handleDeleteText = useCallback(
    (index) => {
      onDeleteText(index);
    },
    [onDeleteText]
  );

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
  }, [selectedTextIndex, handleDeleteText]);

  const handleDragEnd = (index, e) => {
    onUpdateText(index, { x: e.target.x(), y: e.target.y() });
  };

  const handleTransformEnd = (index, e) => {
    const node = textRefs.current[index];
    const scaleY = node.scaleY();

    const newFontSize = Math.round(texts[index].fontSize * scaleY);

    node.scaleX(1);
    node.scaleY(1);

    const rotation = node.rotation();
    const x = node.x();
    const y = node.y();

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

  const handleStageMouseDown = (e) => {
    if (e.target.name() === 'background') {
      setSelectedTextIndex(null);
      onSelectText(null);
    }
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
        onMouseDown={handleStageMouseDown}
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={typeof window !== "undefined" ? window.innerWidth * 0.9 : 800}
            height={typeof window !== "undefined" ? window.innerWidth * 0.6 : 600}
            fill="white"
            onMouseDown={handleStageMouseDown}
            name="background"
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
              scaleX={1}
              scaleY={1}
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

import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Rect, Text, Transformer } from 'react-konva';

function Canvas({ texts, onSelectText, onDeleteText }) {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth * 0.9 : 800,
    height: typeof window !== "undefined" ? window.innerWidth * 0.6 : 600,
  });
  const [textPositions, setTextPositions] = useState([]);
  const [selectedTextIndex, setSelectedTextIndex] = useState(null);
  const transformerRef = useRef(null);
  const stageRef = useRef(null);
  const textRefs = useRef([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        const newWidth = window.innerWidth * 0.9;
        const newHeight = newWidth * 0.6;
        setDimensions({ width: newWidth, height: newHeight });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (texts && texts.length > 0) {
      setTextPositions(
        texts.map((text) => ({
          x: dimensions.width / 2,
          y: dimensions.height / 2,
          text: text.text,
          fontSize: text.fontSize || 24,
          color: text.color || 'black',
        }))
      );
    }
  }, [texts, dimensions]);

  useEffect(() => {
    if (selectedTextIndex !== null && transformerRef.current && textRefs.current[selectedTextIndex]) {
      transformerRef.current.nodes([textRefs.current[selectedTextIndex]]);
      transformerRef.current.getLayer().batchDraw();
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedTextIndex, textPositions]);

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
    const newPositions = [...textPositions];
    newPositions[index] = { ...newPositions[index], x: e.target.x(), y: e.target.y() };
    setTextPositions(newPositions);
  };

  const handleTransformEnd = (index, e) => {
    const node = textRefs.current[index];
    const newPositions = [...textPositions];
    newPositions[index] = {
      ...newPositions[index],
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    };
    setTextPositions(newPositions);
  };

  const handleTextClick = (index) => {
    setSelectedTextIndex(index);
    if (typeof onSelectText === 'function') {
      onSelectText(index);
    }
  };

  // 空白をクリックした際に選択解除
  const handleStageMouseDown = (e) => {
    // 背景のRectをクリックした場合
    if (e.target.name() === 'background') {
      setSelectedTextIndex(null);
      if (typeof onSelectText === 'function') {
        onSelectText(null);
      }
    }
  };

  const handleDeleteText = (index) => {
    const newPositions = textPositions.filter((_, i) => i !== index);
    setTextPositions(newPositions);
    setSelectedTextIndex(null);
    if (typeof onDeleteText === 'function') {
      onDeleteText(index);
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
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleStageMouseDown} // Stage全体のクリックハンドラ
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
            fill="white"
            onMouseDown={handleStageMouseDown} // 背景のクリックハンドラ
            name="background" // 背景を識別するための名前を付与
          />
          {textPositions.map((pos, index) => (
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
              scaleX={pos.scaleX || 1}
              scaleY={pos.scaleY || 1}
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

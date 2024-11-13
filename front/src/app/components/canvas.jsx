import React, { useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

function Canvas({ texts }) {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth * 0.9 : 800,
    height: typeof window !== "undefined" ? window.innerWidth * 0.6 : 600,
  });

  const [textPositions, setTextPositions] = useState([]);
  const [selectedTextIndex, setSelectedTextIndex] = useState(null);
  const [textProperties, setTextProperties] = useState({
    fontSize: 24,
    color: 'black',
  });

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
      const newText = texts[texts.length - 1];
      console.log("Adding new text to Canvas:", newText);
      setTextPositions((positions) => [
        ...positions,
        {
          x: dimensions.width / 2,
          y: dimensions.height / 2,
          text: newText.text,
          fontSize: newText.fontSize || 24,
          color: newText.color || 'black',
        },
      ]);
    }
  }, [texts, dimensions]);

  const handleDragEnd = (index, e) => {
    const newPositions = [...textPositions];
    newPositions[index] = { ...newPositions[index], x: e.target.x(), y: e.target.y() };
    setTextPositions(newPositions);
  };

  if (typeof window === "undefined") {
    return null;
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      paddingTop: "20px",
    }}>
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          <Rect
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
            fill="white"
          />
          {textPositions.map((pos, index) => (
            <Text
              key={index}
              text={pos.text}
              x={pos.x}
              y={pos.y}
              draggable
              onDragEnd={(e) => handleDragEnd(index, e)}
              fontSize={pos.fontSize}
              fill={pos.color}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

export default Canvas;

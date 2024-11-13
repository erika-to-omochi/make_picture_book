import React, { useEffect, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';

function Canvas(props) {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 0.9,
    height: window.innerWidth * 0.6,
  });

  useEffect(() => {
    // 画面リサイズ時にキャンバスサイズを更新
    const handleResize = () => {
      const newWidth = window.innerWidth * 0.9;
      const newHeight = newWidth * 0.6;
      setDimensions({ width: newWidth, height: newHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 中央揃えの位置計算
  const canvasX = (window.innerWidth - dimensions.width) / 2;
  const canvasY = (window.innerHeight - dimensions.height) / 8;

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect
          x={canvasX}
          y={canvasY}
          width={dimensions.width}
          height={dimensions.height}
          fill="white"
        />
      </Layer>
    </Stage>
  );
}

export default Canvas;

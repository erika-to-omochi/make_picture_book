import React from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';

function PageDetail({ page, width = 800, height = 600 }) {
  const stageWidth = width;
  const stageHeight = height;

  // ロード済み画像を管理
  const [loadedImages, setLoadedImages] = React.useState([]);

  React.useEffect(() => {
    const loadImages = async () => {
      const promises = page.page_elements
        .filter((el) => el.element_type === 'image')
        .map((imgEl) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = imgEl.content.src.startsWith('http')
              ? imgEl.content.src
              : `http://localhost:3000${imgEl.content.src}`;
            img.onload = () => resolve({ ...imgEl, image: img });
          });
        });

      const results = await Promise.all(promises);
      setLoadedImages(results);
    };

    loadImages();
  }, [page.page_elements]);

  return (
    <Stage width={stageWidth} height={stageHeight}>
      <Layer>
        {/* 背景 */}
        <Rect x={0} y={0} width={stageWidth} height={stageHeight} fill="#ffffff" />

        {/* テキスト要素の描画 */}
        {page.page_elements
          .filter((el) => el.element_type === 'text')
          .map((textEl, index) => (
            <Text
              key={`text-${index}`}
              text={textEl.content.text}
              fontSize={textEl.content.font_size}
              fill={textEl.content.font_color}
              x={textEl.content.position_x}
              y={textEl.content.position_y}
            />
          ))}

        {/* 画像要素の描画 */}
        {loadedImages.map((imgEl, index) => (
          <KonvaImage
            key={`image-${index}`}
            image={imgEl.image}
            x={imgEl.content.position_x}
            y={imgEl.content.position_y}
            width={imgEl.content.width}
            height={imgEl.content.height}
          />
        ))}
      </Layer>
    </Stage>
  );
}

export default PageDetail;

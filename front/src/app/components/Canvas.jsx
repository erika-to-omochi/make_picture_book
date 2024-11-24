'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Image as KonvaImage } from 'react-konva';
import useCanvasStore from '../../stores/canvasStore';
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import ModalManager from './ModalManager';

function Canvas({ showActionButtons }) {
  const {
    selectedTextIndex,
    selectedImageIndex,
    setSelectedTextIndex,
    setSelectedImageIndex,
    resetSelection,
    pages,
    currentPageIndex,
    addPage,
    setCurrentPageIndex,
    deleteText,
    deleteImage,
    updateImage,
    handleUpdateText,
  } = useCanvasStore();

  const transformerRef = useRef(null);
  const stageRef = useRef(null);
  const textRefs = useRef([]);
  const imageRefs = useRef([]);

  const stageWidth = typeof window !== "undefined" ? window.innerWidth * 0.8 : 800;
  const stageHeight = stageWidth * 0.75;

  // ローカルステートとして loadedImages を管理
  const [loadedImages, setLoadedImages] = useState([]);

  const router = useRouter();

  // ページの初期化と安全な取得
  const currentPage = pages[currentPageIndex] || {
    content: {
      texts: [],
      images: [],
      backgroundColor: '#ffffff',
    },
    book_id: 1,
    page_number: pages.length + 1,
  };

  if (!currentPage.content) {
    currentPage.content = {
      texts: [],
      images: [],
      backgroundColor: '#ffffff',
    };
  }

  // content が存在することを保証
  if (!currentPage.content) {
    console.error("currentPage.content is undefined", currentPage);
    currentPage.content = {
      texts: [],
      images: [],
      backgroundColor: '#ffffff',
    };
  }

  // 画像の読み込み
  useEffect(() => {
    let isMounted = true; // マウント状態を追跡
    const loadImages = async () => {
      const promises = currentPage.content.images.map((img) => {
        return new Promise((resolve) => {
          const image = new window.Image();
          image.src = img.src;
          image.onload = () => resolve({ ...img, image });
          image.onerror = () => resolve(null); // エラー時も null を返す
        });
      });
      try {
        const results = await Promise.all(promises);
        const validResults = results.filter(Boolean); // 有効な画像のみ保持
        if (isMounted) {
          setLoadedImages(validResults);
        }
      } catch (error) {
        console.error("Error loading images:", error);
        if (isMounted) {
          setLoadedImages([]);
        }
      }
    };
    if (currentPage.content.images && currentPage.content.images.length > 0) {
      loadImages();
    } else {
      setLoadedImages([]); // 画像がない場合に空配列
    }
    return () => {
      isMounted = false; // クリーンアップ
    };
  }, [currentPage.content.images]);

  // Transformerの更新
  useEffect(() => {
    if (transformerRef.current) {
      if (selectedTextIndex !== null && textRefs.current[selectedTextIndex]) {
        transformerRef.current.nodes([textRefs.current[selectedTextIndex]]);
      } else if (selectedImageIndex !== null && imageRefs.current[selectedImageIndex]) {
        transformerRef.current.nodes([imageRefs.current[selectedImageIndex]]);
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedTextIndex, selectedImageIndex, currentPage.content.texts, loadedImages]);

  // キーボードイベントの処理
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace') {
        if (selectedTextIndex !== null) {
          deleteText(selectedTextIndex);
          setSelectedTextIndex(null);
        } else if (selectedImageIndex !== null) {
          deleteImage(selectedImageIndex);
          setSelectedImageIndex(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTextIndex, selectedImageIndex, deleteText, deleteImage, setSelectedTextIndex, setSelectedImageIndex]);

  // ドラッグ終了時の処理
  const handleDragEnd = (index, e, type) => {
    const update = { x: e.target.x(), y: e.target.y() };
    if (type === 'text') handleUpdateText(update);
    else if (type === 'image') updateImage(update);
  };

  // 変形終了時の処理
  const handleTransformEnd = (index, e, type) => {
    const node = type === 'text' ? textRefs.current[index] : imageRefs.current[index];
    const newProperties = {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    };
    if (type === 'text') {
      newProperties.fontSize = currentPage.content.texts[index].fontSize * newProperties.scaleY;
      node.scaleX(1);
      node.scaleY(1);
      handleUpdateText(newProperties);
    } else if (type === 'image') {
      updateImage(index, newProperties);
    }
  };

  // テキストクリック時の処理
  const handleTextClick = (index) => {
    console.log("Text clicked at index:", index);
    setSelectedTextIndex(index);
    setSelectedImageIndex(null);
  };

  // ステージクリック時の処理
  const handleStageMouseDown = (e) => {
    if (e.target.name() === 'background') {
      resetSelection();
    }
  };

  // ロードされた画像のログ出力
  useEffect(() => {
    loadedImages.forEach((img, index) => {
    });
  }, [loadedImages]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "20px" }}>
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        fill={currentPage.content.backgroundColor}
        onMouseDown={handleStageMouseDown}
        style={{ border: '1px solid #ccc' }} // 確認用に境界線を追加
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={stageWidth}
            height={stageHeight}
            fill={currentPage.content.backgroundColor|| "#ffffff"}
            onMouseDown={handleStageMouseDown}
            name="background"
          />
          {currentPage.content.texts.map((pos, index) => (
            <Text
              key={index}
              ref={(el) => (textRefs.current[index] = el)}
              text={pos.text}
              x={pos.x}
              y={pos.y}
              draggable
              onDragEnd={(e) => handleDragEnd(index, e, 'text')}
              onTransformEnd={(e) => handleTransformEnd(index, e, 'text')}
              fontSize={pos.fontSize}
              fill={pos.color}
              onClick={() => handleTextClick(index)}
              rotation={pos.rotation || 0}
              scaleX={1}
              scaleY={1}
            />
          ))}
          {Array.isArray(loadedImages) && loadedImages.map((img, index) => (
            <KonvaImage
              key={`img-${index}`}
              ref={(el) => (imageRefs.current[index] = el)}
              image={img.image}
              x={img.x}
              y={img.y}
              draggable
              onDragEnd={(e) => handleDragEnd(index, e, 'image')}
              onTransformEnd={(e) => handleTransformEnd(index, e, 'image')}
              onClick={() => { setSelectedImageIndex(index); setSelectedTextIndex(null); }}
              width={img.width}
              height={img.height}
            />
          ))}
          {(selectedTextIndex !== null || selectedImageIndex !== null) && (
            <Transformer ref={transformerRef} anchorSize={8} borderDash={[6, 2]} keepRatio={true} />
          )}
        </Layer>
      </Stage>
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        {/* ページ移動エリア */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
            disabled={currentPageIndex === 0}
            className="p-2 text-bodyText flex items-center justify-center"
          >
            <FaChevronCircleLeft size={32} />
          </button>
          {/* 現在のページ / 総ページ数 */}
          <div className="flex items-center space-x-2">
            <span className="text-bodyText font-semibold"></span>
            <input
              type="number"
              min={1}
              max={pages.length}
              value={currentPageIndex + 1}
              onChange={(e) => {
                const page = parseInt(e.target.value, 10) - 1; // ユーザーの入力をインデックスに変換
                if (page >= 0 && page < pages.length) {
                  setCurrentPageIndex(page); // ページを設定
                }
              }}
              className="w-16 p-1 text-center border rounded-md border-gray-300"
            />
            <span className="text-bodyText font-semibold">/ {pages.length}</span>
          </div>
          <button
            onClick={() => {
              if (currentPageIndex < pages.length - 1) {
                setCurrentPageIndex(currentPageIndex + 1);
              } else {
                addPage();
              }
            }}
            className="p-2 text-bodyText flex items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:text-blue-500 hover:bg-blue-100 hover:shadow-md"
          >
            <FaChevronCircleRight size={32} />
          </button>
        </div>
        {showActionButtons && (
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <ModalManager />
        </div>
        )}
      </div>
    </div>
  );
}

export default Canvas;

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Image as KonvaImage } from 'react-konva';
import useCanvasStore from '../../stores/canvasStore';
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import ModalManager from './ModalManager';

function Canvas({ showActionButtons, isReadOnly, allowAddPage }) {
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
    bookId: 1,
    pageNumber: pages.length + 1,
    backgroundColor: '#ffffff',
    pageElements: [],
    pageCharacters: [],
    id: null,
  };

  // 画像の読み込み
  useEffect(() => {
    let isMounted = true; // マウント状態を追跡
    const loadImages = async () => {
      const imageElements = currentPage.pageElements.filter(el => el.elementType === 'image');
      const promises = imageElements.map((el) => {
        return new Promise((resolve) => {
          const image = new window.Image();
          image.src = el.src;
          image.onload = () => resolve({ ...el, image });
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
    if (currentPage.pageElements && currentPage.pageElements.length > 0) {
      loadImages();
    } else {
      setLoadedImages([]); // 画像がない場合に空配列
    }
    return () => {
      isMounted = false; // クリーンアップ
    };
  }, [currentPage.pageElements]);

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
  }, [selectedTextIndex, selectedImageIndex, currentPage.pageElements, loadedImages]);

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
    if (isReadOnly) return;
    const update = {
      positionX: e.target.x(),
      positionY: e.target.y()
    };
    if (type === 'text') {
      handleUpdateText(index, update);
    } else if (type === 'image') {
      updateImage(index, update);
    }
  };

  // 変形終了時の処理
  const handleTransformEnd = (index, e, type) => {
    if (isReadOnly) return;
    const node = type === 'text' ? textRefs.current[index] : imageRefs.current[index];
    const newProperties = {
      positionX: node.x(),
      positionY: node.y(),
      rotation: node.rotation(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    };
    if (type === 'text') {
      const updatedFontSize = currentPage.pageElements[index].fontSize * newProperties.scaleY;
      node.scaleX(1);
      node.scaleY(1);
      handleUpdateText(index, {
        positionX: newProperties.positionX,
        positionY: newProperties.positionY,
        rotation: newProperties.rotation,
        fontSize: updatedFontSize,
      });
    } else if (type === 'image') {
      updateImage(index, {
        positionX: newProperties.positionX,
        positionY: newProperties.positionY,
        rotation: newProperties.rotation,
        scaleX: newProperties.scaleX,
        scaleY: newProperties.scaleY,
      });
        // スケールをリセットしてストアに保存
        node.scaleX(1);
        node.scaleY(1);
    }
  };

  // テキストクリック時の処理
  const handleTextClick = (index) => {
    if (isReadOnly) return;
    console.log("Text clicked at index:", index);
    setSelectedTextIndex(index);
    setSelectedImageIndex(null);
  };

  // 画像クリック時の処理
const handleImageClick = (index) => {
  if (isReadOnly) return;
  console.log("Image clicked at index:", index);
  setSelectedImageIndex(index);
  setSelectedTextIndex(null);
};

  // ステージクリック時の処理
  const handleStageMouseDown = (e) => {
    if (e.target.name() === 'background') {
      resetSelection();
    }
  };

  // ロードされた画像のログ出力（必要に応じて実装）
  useEffect(() => {
    loadedImages.forEach((img, index) => {
      // 必要に応じて処理
    });
  }, [loadedImages]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "20px" }}>
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        onMouseDown={handleStageMouseDown}
        style={{ border: '1px solid #ccc' }} // 確認用に境界線を追加
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={stageWidth}
            height={stageHeight}
            fill={currentPage.backgroundColor || "#ffffff"}
            onMouseDown={handleStageMouseDown}
            name="background"
          />
          {currentPage.pageElements.map((element, index) => {
            if (element.elementType === 'text') {
              return (
                <Text
                key={`text-${index}`}
                ref={(el) => (textRefs.current[index] = el)}
                text={element.text}
                x={element.positionX}
                y={element.positionY}
                draggable={!isReadOnly}
                onDragEnd={(e) => handleDragEnd(index, e, 'text')}
                onTransformEnd={(e) => handleTransformEnd(index, e, 'text')}
                fontSize={element.fontSize}
                fill={element.fontColor}
                onClick={() => handleTextClick(index)}
                rotation={element.rotation || 0}
                scaleX={1}
                scaleY={1}
              />
              );
            } else if (element.elementType === 'image') {
              const loadedImage = loadedImages.find(img => img.src === element.src);
              if (!loadedImage) return null;
              return (
                <KonvaImage
                  key={`image-${index}`}
                  ref={(el) => (imageRefs.current[index] = el)}
                  image={loadedImage.image}
                  x={element.positionX}
                  y={element.positionY}
                  draggable={!isReadOnly}
                  onDragEnd={(e) => handleDragEnd(index, e, 'image')}
                  onTransformEnd={(e) => handleTransformEnd(index, e, 'image')}
                  onClick={() => { handleImageClick(index); }}
                  scaleX={element.scaleX || 1}
                  scaleY={element.scaleY || 1}
                  rotation={element.rotation || 0}
                />
              );
            }
            return null;
          })}
          {(!isReadOnly && (selectedTextIndex !== null || selectedImageIndex !== null)) && (
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
                if (allowAddPage) { // ページ追加が許可されている場合のみ追加
                  addPage();
                } else {
                  alert("このページではページの追加はできません。");
                }
              }
            }}
            className={`p-2 text-bodyText flex items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:text-blue-500 hover:bg-blue-100 hover:shadow-md ${
              !allowAddPage && currentPageIndex >= pages.length - 1 ? 'cursor-not-allowed opacity-50' : ''
            }`}
            disabled={!allowAddPage && currentPageIndex >= pages.length - 1} // ページ追加が許可されていないかつ最後のページの場合に無効化
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

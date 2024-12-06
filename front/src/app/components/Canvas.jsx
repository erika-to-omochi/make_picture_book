// Canvas.jsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Image as KonvaImage } from 'react-konva';
import useCanvasStore from '../../stores/canvasStore';
import { FaChevronCircleLeft, FaChevronCircleRight, FaUndo } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import ModalManager from './ModalManager';
import useIsMobile from '../../hooks/useIsMobile'; // 必要に応じてパスを調整

function Canvas({ showActionButtons, isReadOnly, allowAddPage, showUndoButton, setPanel, allowAddText = true }) {
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
    handleAddText,
    undo,
    history,
  } = useCanvasStore();

  const transformerRef = useRef(null);
  const stageRef = useRef(null);
  const textRefs = useRef([]);
  const imageRefs = useRef([]);

  // 仮想キャンバスの寸法を定義
  const VIRTUAL_CANVAS_WIDTH = 800;
  const VIRTUAL_CANVAS_HEIGHT = 568;
  const [stageWidth, setStageWidth] = useState(VIRTUAL_CANVAS_WIDTH);
  const [stageHeight, setStageHeight] = useState(VIRTUAL_CANVAS_HEIGHT);
  const [scale, setScale] = useState({ scaleX: 1, scaleY: 1 });

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

  // カスタムフックを使用してモバイル判定
  const isMobile = useIsMobile();

  // 編集モードの状態管理
  const [editingTextIndex, setEditingTextIndex] = useState(null);
  const [editingTextValue, setEditingTextValue] = useState('');
  const [inputWidth, setInputWidth] = useState(100);

  // テキストの幅を測定する関数
  const getTextWidth = (text, fontSize, fontFamily = 'Arial', fontWeight = 'normal') => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const metrics = context.measureText(text);
    return metrics.width;
  };

  // ウィンドウのリサイズを処理し、キャンバスサイズとスケールを調整
  useEffect(() => {
    const handleResize = () => {
      const newStageWidth = window.innerWidth * 0.6;
      const aspectRatio = VIRTUAL_CANVAS_HEIGHT / VIRTUAL_CANVAS_WIDTH; // 正しいアスペクト比を計算
      const newStageHeight = newStageWidth * aspectRatio;
      const newScaleX = newStageWidth / VIRTUAL_CANVAS_WIDTH;
      const newScaleY = newStageHeight / VIRTUAL_CANVAS_HEIGHT;
      setStageWidth(newStageWidth);
      setStageHeight(newStageHeight);
      setScale({ scaleX: newScaleX, scaleY: newScaleY });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初回呼び出し

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
      // イベントが入力フィールド内で発生しているかチェック
      const target = e.target;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (isInputField) {
        return; // 入力フィールド内ではCanvasのキーイベントを無視
      }

      if (editingTextIndex === null) {
        if (e.key === 'Backspace') {
          if (selectedTextIndex !== null) {
            deleteText(selectedTextIndex);
            setSelectedTextIndex(null);
          } else if (selectedImageIndex !== null) {
            deleteImage(selectedImageIndex);
            setSelectedImageIndex(null);
          }
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault(); // デフォルトのアクションを防ぐ
        undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTextIndex, selectedImageIndex, deleteText, deleteImage, setSelectedTextIndex, setSelectedImageIndex, undo, editingTextIndex ]);

  // ドラッグ終了時の処理
  const handleDragEnd = (index, e, type) => {
    if (isReadOnly) return;
    const node = e.target;
    const newPos = node.getPosition();
    const update = {
      positionX: newPos.x,
      positionY: newPos.y
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
    setPanel("文字");
  };

  // 画像クリック時の処理
  const handleImageClick = (index) => {
    if (isReadOnly) return;
    console.log("Image clicked at index:", index);
    setSelectedImageIndex(index);
    setSelectedTextIndex(null);

    const imageCategory = currentPage.pageElements[index].imageCategory;
    if (imageCategory === '人物' || imageCategory === '自然' || imageCategory === 'もの') {
      setPanel(imageCategory);
    }
  };

  // ステージクリック時の処理
  const handleStageMouseDown = (e) => {
    if (e.target.name() === 'background') {
      resetSelection();
      setEditingTextIndex(null); // 編集モードを終了
    }
  };

  // ダブルクリックでテキスト編集モードに入る
  const handleTextDblClick = (index, e) => {
    if (isReadOnly) return;
    e.cancelBubble = true; // イベントの伝播を停止
    console.log(`Double clicked text at index: ${index}`);
    console.log('Current page elements:', currentPage.pageElements);
    if (currentPage.pageElements[index]) {
      setEditingTextIndex(index);
      setEditingTextValue(currentPage.pageElements[index].text);
      setPanel("文字"); // 編集モードに入った際にパネルを開く
    } else {
      console.warn(`No page element found at index: ${index}`);
    }
  };

  // ステージダブルクリック時の処理（新規テキスト追加）
  const handleStageDblClick = (e) => {
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const { x, y } = pointerPosition;

    // スケールを考慮して位置を調整
    const adjustedX = x / scale.scaleX;
    const adjustedY = y / scale.scaleY;

    const newText = {
      text: '',
      fontSize: 32,
      fontColor: '#000000',
      positionX: adjustedX,
      positionY: adjustedY,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      elementType: 'text',
    };

    // handleAddText が新しいテキストのインデックスを返すようにする
    const newIndex = handleAddText(newText); // インデックスを取得

    if (newIndex !== undefined) {
      setSelectedTextIndex(newIndex);
      setEditingTextIndex(newIndex);
      setEditingTextValue(newText.text);
      setPanel("文字"); // 新規テキスト追加時に「文字」パネルを開く
    } else {
      console.error("Failed to add new text element.");
    }
  };

  // テキストの幅に基づいて入力フィールドの幅を更新
  useEffect(() => {
    if (editingTextIndex !== null && currentPage.pageElements[editingTextIndex]) {
      const element = currentPage.pageElements[editingTextIndex];
      const text = editingTextValue || element.text || '';
      const measuredWidth = getTextWidth(text, element.fontSize, 'Arial', 'normal');
      const paddedWidth = measuredWidth + 20; // パディングとして20pxを追加
      setInputWidth(paddedWidth < 100 ? 100 : paddedWidth); // 最小幅を100pxに設定
    }
  }, [editingTextValue, editingTextIndex, currentPage.pageElements]);

  return (
    <div
      className={`flex flex-col pt-2 overflow-y-auto ${
        isMobile ? 'items-center' : 'items-end'
      }`}
      style={{ position: 'relative' }} // 入力フィールドを絶対配置するために相対位置に設定
    >
      <div className="flex flex-col items-center gap-5">
        {/* キャンバスコンテナ */}
        <div
          className={`max-w-none ${
            isMobile ? 'mx-auto' : 'mr-10' // 左マージンを追加
          }`}
        >
          <Stage
            ref={stageRef}
            width={stageWidth}
            height={stageHeight}
            scaleX={scale.scaleX}
            scaleY={scale.scaleY}
            onMouseDown={handleStageMouseDown}
            onDblClick={allowAddText ? handleStageDblClick : undefined} // 条件付きでダブルクリックイベントを設定
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                width={VIRTUAL_CANVAS_WIDTH}
                height={VIRTUAL_CANVAS_HEIGHT}
                fill={currentPage.backgroundColor || "#ffffff"}
                onMouseDown={handleStageMouseDown}
                name="background"
              />
              {currentPage.pageElements.map((element, index) => {
                if (element.elementType === 'text') {
                  if (index === editingTextIndex) {
                    return null;
                  }
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
                      onDblClick={(e) => handleTextDblClick(index, e)} // イベントオブジェクトを渡す
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
                      onClick={(e) => handleImageClick(index)}
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
        </div>
        {/* 編集用の入力フィールド */}
        {editingTextIndex !== null && currentPage.pageElements[editingTextIndex] && (
          <textarea
            type="text"
            value={editingTextValue}
            onChange={(e) => setEditingTextValue(e.target.value)}
            onBlur={() => {
              handleUpdateText(editingTextIndex, { text: editingTextValue });
              setEditingTextIndex(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleUpdateText(editingTextIndex, { text: editingTextValue });
                setEditingTextIndex(null);
              }
              if (e.key === 'Escape') {
                setEditingTextIndex(null);
              }
            }}
            style={{
              position: 'absolute',
              top: (currentPage.pageElements[editingTextIndex]?.positionY * scale.scaleY) + 'px',
              left: (currentPage.pageElements[editingTextIndex]?.positionX * scale.scaleX) + 'px',
              fontSize: (currentPage.pageElements[editingTextIndex]?.fontSize * scale.scaleY) + 'px',
              color: currentPage.pageElements[editingTextIndex]?.fontColor,
              border: 'none',
              padding: '0px',
              margin: '0px',
              background: 'none',
              outline: 'none',
              transform: `rotate(${currentPage.pageElements[editingTextIndex]?.rotation || 0}deg)`,
              width: `${inputWidth}px`, // 動的に計算された幅を適用
              fontFamily: 'inherit',
            }}
            autoFocus
          />
        )}

        {/* 下部の要素コンテナ */}
        <div className="flex flex-col items-center gap-4 w-full max-w-4xl mx-auto mb-28">
          {/* ページ移動エリア */}
          <div className="flex gap-4 items-center justify-center w-full">
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
              className={`p-2 text-bodyText flex items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:text-gray-700 hover:bg-gray-200 hover:shadow-md ${
                !allowAddPage && currentPageIndex >= pages.length - 1 ? 'cursor-not-allowed opacity-50' : ''
              }`}
              disabled={!allowAddPage && currentPageIndex >= pages.length - 1} // ページ追加が許可されていないかつ最後のページの場合に無効化
            >
              <FaChevronCircleRight size={32} />
            </button>
            {/* Undo ボタン */}
            {showUndoButton && (
              <button
                onClick={() => undo()}
                disabled={history.length === 0}
                className={`p-2 text-gray-900 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:text-gray-700 hover:bg-gray-200 hover:shadow-md ${history.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaUndo size={32} />
              </button>
            )}
          </div>
          {/* ModalManager を中央に配置 */}
          {showActionButtons && (
            <div className="flex gap-2 mt-2 mb-40 justify-center w-full">
              <ModalManager />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Canvas;
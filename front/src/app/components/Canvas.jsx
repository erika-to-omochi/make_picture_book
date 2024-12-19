// Canvas.jsx

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Image as KonvaImage, Group } from 'react-konva';
import useCanvasStore from '../../stores/canvasStore';
import { FaChevronCircleLeft, FaChevronCircleRight, FaUndo, FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import ModalManager from './ModalManager';
import useIsMobile from '../../hooks/useIsMobile';

function Canvas({
  showActionButtons,
  isReadOnly,
  allowAddPage,
  showUndoButton,
  setPanel,
  allowAddText = true,
}) {
  const {
    selectedTextIndex,
    selectedImageIndex,
    selectedCharacterIndex,
    setSelectedTextIndex,
    setSelectedImageIndex,
    setSelectedCharacterIndex,
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
    handleAddImage,
    undo,
    history,
    addCharacter,
    updateCharacter,
    deleteCharacter,
  } = useCanvasStore();

  const transformerRef = useRef(null);
  const stageRef = useRef(null);
  const textRefs = useRef([]);
  const imageRefs = useRef([]);
  const characterRefs = useRef([]); // 新たにキャラクターの参照を追加

  // 仮想キャンバスの寸法を定義
  const VIRTUAL_CANVAS_WIDTH = 800;
  const VIRTUAL_CANVAS_HEIGHT = 568;
  const [stageWidth, setStageWidth] = useState(VIRTUAL_CANVAS_WIDTH);
  const [stageHeight, setStageHeight] = useState(VIRTUAL_CANVAS_HEIGHT);
  const [scale, setScale] = useState({ scaleX: 1, scaleY: 1 });

  // コピーした要素を保存するためのref
  const copiedElement = useRef(null);

  // ローカルステートとして loadedImages を管理
  const [loadedImages, setLoadedImages] = useState([]);
  const [loadedCharacterImages, setLoadedCharacterImages] = useState({}); // キャラクター画像のステート

  const router = useRouter();

  // ページの初期化と安全な取得
  const currentPage =
    pages[currentPageIndex] || {
      bookId: 1,
      pageNumber: pages.length + 1,
      backgroundColor: '#ffffff',
      pageElements: [],
      pageCharacters: [],
      id: null,
      elementsToDelete: [],
    };

  // カスタムフックを使用してモバイル判定
  const isMobile = useIsMobile();

  // 編集モードの状態管理
  const [editingTextIndex, setEditingTextIndex] = useState(null);
  const [editingTextValue, setEditingTextValue] = useState('');
  const [inputWidth, setInputWidth] = useState(100);

  // テキストの幅を測定する関数
  const getTextWidth = (
    text,
    fontSize,
    fontFamily = 'Arial',
    fontWeight = 'normal'
  ) => {
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
      const imageElements = currentPage.pageElements.filter(
        (el) => el.elementType === 'image'
      );
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

  // キャラクター画像の読み込み
  useEffect(() => {
    let isMounted = true;
    const loadCharacterImages = async () => {
      const characterElements = currentPage.pageCharacters;
      const imagePromises = characterElements.flatMap((char) =>
        char.parts.map((part) => {
          return new Promise((resolve) => {
            const img = new window.Image();
            img.src = part.src;
            img.onload = () => resolve({ src: part.src, image: img });
            img.onerror = () => resolve({ src: part.src, image: null });
          });
        })
      );

      try {
        const results = await Promise.all(imagePromises);
        const imagesMap = {};
        results.forEach((result) => {
          if (result.image) {
            imagesMap[result.src] = result.image;
          }
        });
        if (isMounted) {
          setLoadedCharacterImages(imagesMap);
        }
      } catch (error) {
        console.error("Error loading character images:", error);
        if (isMounted) {
          setLoadedCharacterImages({});
        }
      }
    };

    if (currentPage.pageCharacters && currentPage.pageCharacters.length > 0) {
      loadCharacterImages();
    } else {
      setLoadedCharacterImages({});
    }

    return () => {
      isMounted = false;
    };
  }, [currentPage.pageCharacters]);

  // Transformerの更新
  useEffect(() => {
    if (transformerRef.current) {
      if (selectedTextIndex !== null && textRefs.current[selectedTextIndex]) {
        transformerRef.current.nodes([textRefs.current[selectedTextIndex]]);
      } else if (
        selectedImageIndex !== null &&
        imageRefs.current[selectedImageIndex]
      ) {
        transformerRef.current.nodes([imageRefs.current[selectedImageIndex]]);
      } else if (
        selectedCharacterIndex !== null &&
        characterRefs.current[selectedCharacterIndex]
      ) {
        transformerRef.current.nodes([characterRefs.current[selectedCharacterIndex]]);
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedTextIndex, selectedImageIndex, selectedCharacterIndex, currentPage.pageElements, loadedImages, loadedCharacterImages]);

  // キーボードイベントの処理
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInputField) {
        return;
      }

      // コピー機能（Ctrl+CまたはCmd+C）
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        if (isReadOnly) return; // 読み取り専用モードでは無効化

        e.preventDefault(); // デフォルトのコピー動作を防止

        if (selectedTextIndex !== null) {
          const textElement = currentPage.pageElements[selectedTextIndex];
          if (textElement) {
            copiedElement.current = {
              type: 'text',
              data: { ...textElement },
            };
          }
        } else if (selectedImageIndex !== null) {
          const imageElement = currentPage.pageElements[selectedImageIndex];
          if (imageElement) {
            copiedElement.current = {
              type: 'image',
              data: { ...imageElement },
            };
          }
        } else if (selectedCharacterIndex !== null) {
          const characterElement = currentPage.pageCharacters[selectedCharacterIndex];
          if (characterElement) {
            copiedElement.current = {
              type: 'character',
              data: { ...characterElement },
            };
          }
        }
        return;
      }

      // ペースト機能（Ctrl+VまたはCmd+V）
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        if (isReadOnly) return; // 読み取り専用モードでは無効化

        e.preventDefault(); // デフォルトのペースト動作を防止

        if (copiedElement.current) {
          const elementToPaste = { ...copiedElement.current.data };

          // オフセットを適用して重複を回避
          const OFFSET = 20;
          elementToPaste.positionX = (elementToPaste.positionX || 0) + OFFSET;
          elementToPaste.positionY = (elementToPaste.positionY || 0) + OFFSET;

          if (elementToPaste.elementType === 'text') {
            const newText = {
              ...elementToPaste,
              text: elementToPaste.text || '',
            };
            const newIndex = handleAddText(newText); // インデックスを取得

            if (newIndex !== undefined) {
              setSelectedTextIndex(newIndex);
              setEditingTextIndex(newIndex);
              setEditingTextValue(newText.text);
              setPanel("文字");
            }
          } else if (elementToPaste.elementType === 'image') {
            const newImage = {
              ...elementToPaste,
            };
            handleAddImage({ ...newImage })
              .then((newIndex) => {
                setSelectedImageIndex(newIndex);
                setPanel(newImage.imageCategory || '画像');
              })
              .catch((error) => {
                console.error("画像のペーストに失敗しました:", error);
              });
          } else if (elementToPaste.elementType === 'character') {
            const characterData = {
              parts: elementToPaste.parts,
              positionX: elementToPaste.positionX,
              positionY: elementToPaste.positionY,
              scaleX: elementToPaste.scaleX,
              scaleY: elementToPaste.scaleY,
              rotation: elementToPaste.rotation,
            };
            addCharacter(characterData);
          }
        } else {
          console.warn('ペーストする要素がありません。');
        }
        return;
      }
      // 既存のキーイベント（Backspace, Undo）
      if (editingTextIndex === null) {
        if (e.key === 'Backspace') {
          if (selectedTextIndex !== null) {
            deleteText(selectedTextIndex);
            setSelectedTextIndex(null);
          } else if (selectedImageIndex !== null) {
            deleteImage(selectedImageIndex);
            setSelectedImageIndex(null);
          } else if (selectedCharacterIndex !== null) {
            deleteCharacter(currentPage.pageCharacters[selectedCharacterIndex].id);
            setSelectedCharacterIndex(null);
          }
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault(); // デフォルトのアンドゥ動作を防止
        undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedTextIndex,
    selectedImageIndex,
    selectedCharacterIndex,
    deleteText,
    deleteImage,
    setSelectedTextIndex,
    setSelectedImageIndex,
    setSelectedCharacterIndex,
    undo,
    editingTextIndex,
    isReadOnly,
    currentPage.pageElements,
    handleAddText,
    handleAddImage,
    addCharacter,
    setPanel,
  ]);

  // ドラッグ終了時の処理
  const handleDragEnd = (index, e, type) => {
    if (isReadOnly) return;
    const node = e.target;
    const newPos = node.getPosition();
    const update = {
      positionX: newPos.x,
      positionY: newPos.y,
    };
    if (type === 'text') {
      handleUpdateText(index, update);
    } else if (type === 'image') {
      updateImage(index, update);
    }
  };

  // キャラクターのドラッグ終了時の処理
  const handleCharacterDragEnd = (charIndex, e) => {
    if (isReadOnly) return;
    const node = e.target;
    const newPos = node.position();
    const update = {
      positionX: newPos.x,
      positionY: newPos.y,
    };
    updateCharacter(charIndex, update);
  };

  // 変形終了時の処理
  const handleTransformEnd = (index, e, type) => {
    if (isReadOnly) return;
    const node =
      type === 'text' ? textRefs.current[index] : imageRefs.current[index];
    const newProperties = {
      positionX: node.x(),
      positionY: node.y(),
      rotation: node.rotation(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    };
    if (type === 'text') {
      const updatedFontSize =
        currentPage.pageElements[index].fontSize * newProperties.scaleY;
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

  // キャラクターの変形終了時の処理
  const handleCharacterTransformEnd = (charIndex, e) => {
    if (isReadOnly) return;
    const node = e.target;
    const newProps = {
      positionX: node.x(),
      positionY: node.y(),
      rotation: node.rotation(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    };
    updateCharacter(charIndex, newProps);
  };

  // テキストクリック時の処理
  const handleTextClick = (index) => {
    if (isReadOnly) return;
    setSelectedTextIndex(index);
    setSelectedImageIndex(null);
    setSelectedCharacterIndex(null);
    setPanel("文字");
  };

  // 画像クリック時の処理
  const handleImageClick = (index) => {
    if (isReadOnly) return;
    setSelectedImageIndex(index);
    setSelectedTextIndex(null);
    setSelectedCharacterIndex(null);

    const imageCategory = currentPage.pageElements[index].imageCategory;
    if (
      imageCategory === '人物' ||
      imageCategory === '自然' ||
      imageCategory === 'もの'
    ) {
      setPanel(imageCategory);
    }
  };

  // キャラクタークリック時の処理
  const handleCharacterClick = (charIndex) => {
    if (isReadOnly) return;
    setSelectedCharacterIndex(charIndex);
    setSelectedTextIndex(null);
    setSelectedImageIndex(null);
    setPanel("ひと"); // 「ひと」パネルを開く
  };

  // ステージクリック時の処理
  const handleStageMouseDown = (e) => {
    if (e.target.name() === 'background') {
      resetSelection();
      setSelectedCharacterIndex(null);
      setEditingTextIndex(null); // 編集モードを終了
    }
  };

  // ダブルクリックでテキスト編集モードに入る
  const handleTextDblClick = (index, e) => {
    if (isReadOnly) return;
    e.cancelBubble = true; // イベントの伝播を停止
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
      id: '', // handleAddText で設定されるので空文字
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
      <div className="flex flex-col items-center">
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
                  const loadedImage = loadedImages.find(
                    (img) => img.src === element.src
                  );
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
              {/* キャラクターの描画 */}
              {currentPage.pageCharacters.map((character, charIndex) => {
                const { id, parts, positionX, positionY, scaleX, scaleY, rotation } = character;
                return (
                  <Group
                    key={`character-${id}`}
                    ref={(el) => (characterRefs.current[charIndex] = el)}
                    x={positionX}
                    y={positionY}
                    scaleX={scaleX}
                    scaleY={scaleY}
                    rotation={rotation}
                    draggable={!isReadOnly}
                    onDragEnd={(e) => handleCharacterDragEnd(charIndex, e)}
                    onTransformEnd={(e) => handleCharacterTransformEnd(charIndex, e)}
                    onClick={() => handleCharacterClick(charIndex)}
                  >
                    {parts.map((part, partIndex) => {
                      const image = loadedCharacterImages[part.src];
                      if (!image) return null;
                      return (
                        <KonvaImage
                          key={`character-${id}-part-${partIndex}`}
                          image={image}
                          x={0} // パーツの相対位置に応じて調整
                          y={0}
                          draggable={false}
                        />
                      );
                    })}
                  </Group>
                );
              })}
              {/*
                Show Transformer only when not read-only and an element is selected
              */}
              {!isReadOnly && (selectedTextIndex !== null || selectedImageIndex !== null || selectedCharacterIndex !== null) && (
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
              top: `${(currentPage.pageElements[editingTextIndex]?.positionY || 0) * scale.scaleY}px`,
              left: `${(currentPage.pageElements[editingTextIndex]?.positionX || 0) * scale.scaleX}px`,
              fontSize: `${(currentPage.pageElements[editingTextIndex]?.fontSize || 32) * scale.scaleY}px`,
              color: currentPage.pageElements[editingTextIndex]?.fontColor,
              border: 'none',
              padding: '0px',
              margin: '0px',
              background: 'none',
              outline: 'none',
              transform: `rotate(${currentPage.pageElements[editingTextIndex]?.rotation || 0}deg)`,
              width: `${inputWidth}px`, // 動的に計算された幅を適用
              fontFamily: 'inherit',
              resize: 'none', // オプション: リサイズを防止
              overflow: 'hidden', // オプション: オーバーフローを隠す
            }}
            autoFocus
          />
        )}

        {/* 下部の要素コンテナ */}
        <div className="flex flex-col items-center gap-4 w-full max-w-4xl mx-auto">
          {/* ページ移動エリア */}
          <div className="flex gap-4 items-center justify-center w-full">
            {/* 前のページボタンとラベル */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
                disabled={currentPageIndex === 0}
                className={`p-2 flex items-center justify-center rounded-full transition-transform duration-200 ease-in-out transform hover:-translate-y-1 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-bodyText`}
                aria-label="前のページ"
              >
                <FaChevronCircleLeft size={32} />
              </button>
            </div>

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
                className="w-16 p-1 text-center border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-bodyText"
              />
              <span className="text-bodyText font-semibold">/ {pages.length}</span>
            </div>

            {/* 次のページボタンとラベル */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  if (currentPageIndex < pages.length - 1) {
                    setCurrentPageIndex(currentPageIndex + 1);
                  }
                }}
                className={`p-2 flex items-center justify-center rounded-full transition-transform duration-200 ease-in-out transform hover:-translate-y-1 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-bodyText`}
                disabled={currentPageIndex >= pages.length - 1 && !allowAddPage}
                aria-label="次のページ"
              >
                <FaChevronCircleRight size={32} />
              </button>
            </div>

            {/* 「+」ボタンの追加とラベル */}
            {allowAddPage && (
              <div className="flex flex-col items-center">
                <button
                  onClick={addPage}
                  className={`p-2 flex items-center justify-center rounded-full transition-transform duration-200 ease-in-out transform hover:-translate-y-1 active:translate-y-0.5 text-bodyText`}
                  aria-label="ページを追加"
                >
                  <FaPlus size={32} />
                </button>
              </div>
            )}

            {/* Undo ボタンとラベル */}
            {showUndoButton && (
              <div className="flex flex-col items-center">
                <button
                  onClick={() => undo()}
                  disabled={history.length === 0}
                  className={`p-2 flex items-center justify-center rounded-full transition-transform duration-200 ease-in-out transform hover:-translate-y-1 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-bodyText`}
                  aria-label="1つ戻る"
                >
                  <FaUndo size={32} />
                </button>
              </div>
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

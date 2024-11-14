"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Image as KonvaImage } from 'react-konva';
import Modal from './Modal'; // モーダルをインポート

function Canvas({
  texts,
  images,
  onSelectText,
  onDeleteText,
  onUpdateText,
  onDeleteImage,
  onUpdateImage,
  backgroundColor,
  onComplete,
  onSaveDraft
}) {
  const [selectedTextIndex, setSelectedTextIndex] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [loadedImages, setLoadedImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState("public");

  const transformerRef = useRef(null);
  const stageRef = useRef(null);
  const textRefs = useRef([]);
  const imageRefs = useRef([]);

  const stageWidth = typeof window !== "undefined" ? window.innerWidth * 0.8 : 800;
  const stageHeight = stageWidth * 0.75;

  // 画像読み込み
  useEffect(() => {
    const loadImages = async () => {
      const promises = images.map((img) => {
        return new Promise((resolve) => {
          const image = new window.Image();
          image.src = img.src;
          image.onload = () => resolve({ ...img, image });
        });
      });
      const results = await Promise.all(promises);
      setLoadedImages(results);
    };
    loadImages();
  }, [images]);

  // 選択時にTransformer更新
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
  }, [selectedTextIndex, selectedImageIndex, texts, loadedImages]);

  // バックスペースキーで削除
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace') {
        if (selectedTextIndex !== null) {
          onDeleteText(selectedTextIndex);
          setSelectedTextIndex(null);
        } else if (selectedImageIndex !== null) {
          onDeleteImage(selectedImageIndex);
          setSelectedImageIndex(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTextIndex, selectedImageIndex, onDeleteText, onDeleteImage]);

  const handleDragEnd = (index, e, type) => {
    const update = { x: e.target.x(), y: e.target.y() };
    if (type === 'text') onUpdateText(index, update);
    else if (type === 'image') onUpdateImage(index, update);
  };

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
      newProperties.fontSize = texts[index].fontSize * newProperties.scaleY;
      node.scaleX(1);
      node.scaleY(1);
      onUpdateText(index, newProperties);
    } else if (type === 'image') {
      onUpdateImage(index, newProperties);
    }
  };

  const handleTextClick = (index) => {
    setSelectedTextIndex(index);
    setSelectedImageIndex(null);
    onSelectText(index);
  };

  const handleStageMouseDown = (e) => {
    if (e.target.name() === 'background') {
      setSelectedTextIndex(null);
      setSelectedImageIndex(null);
      onSelectText(null);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleModalSave = () => {
    const bookData = { title, author, tags, texts, images, backgroundColor };

    if (modalType === "draft") {
      console.log("Saving as draft", bookData);
      // API呼び出し処理をここに追加
    } else if (modalType === "complete") {
      const completeData = { ...bookData, visibility };
      console.log("Saving as complete with visibility", completeData);
      // API呼び出し処理をここに追加
    }
    closeModal();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "20px" }}>
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        onMouseDown={handleStageMouseDown}
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={stageWidth}
            height={stageHeight}
            fill={backgroundColor}
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
          {loadedImages.map((img, index) => (
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

      {/* キャンバスの下にボタンを配置 */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={() => openModal("complete")} className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80">
          完成
        </button>
        <button onClick={() => openModal("draft")} className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80">
          下書き保存
        </button>
      </div>

      {/* モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleModalSave}
        modalType={modalType}
        title={title}
        setTitle={setTitle}
        author={author}
        setAuthor={setAuthor}
        tags={tags}
        setTags={setTags}
        visibility={visibility}
        setVisibility={setVisibility}
      />
    </div>
  );
}

export default Canvas;

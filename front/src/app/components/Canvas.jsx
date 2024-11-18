"use client";

import React, { useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Image as KonvaImage } from 'react-konva';
import axios from '../../api/axios';
import Modal from './Modal';
import useCanvasStore from '../../stores/canvasStore'; // 作成したストアをインポート

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
  // Zustand ストアから状態とアクションを取得
  const {
    selectedTextIndex,
    selectedImageIndex,
    loadedImages,
    isModalOpen,
    modalType,
    modalData,
    setSelectedTextIndex,
    setSelectedImageIndex,
    setLoadedImages,
    setIsModalOpen,
    setModalType,
    setModalData,
    updateModalDataField,
    resetSelection,
  } = useCanvasStore();

  const transformerRef = useRef(null);
  const stageRef = useRef(null);
  const textRefs = useRef([]);
  const imageRefs = useRef([]);

  const stageWidth = typeof window !== "undefined" ? window.innerWidth * 0.8 : 800;
  const stageHeight = stageWidth * 0.75;

  // 画像の読み込み
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
  }, [images, setLoadedImages]);

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
  }, [selectedTextIndex, selectedImageIndex, texts, loadedImages]);

  // キーボードイベントの処理
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
  }, [selectedTextIndex, selectedImageIndex, onDeleteText, onDeleteImage, setSelectedTextIndex, setSelectedImageIndex]);

  // ドラッグ終了時の処理
  const handleDragEnd = (index, e, type) => {
    const update = { x: e.target.x(), y: e.target.y() };
    if (type === 'text') onUpdateText(index, update);
    else if (type === 'image') onUpdateImage(index, update);
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
      newProperties.fontSize = texts[index].fontSize * newProperties.scaleY;
      node.scaleX(1);
      node.scaleY(1);
      onUpdateText(index, newProperties);
    } else if (type === 'image') {
      onUpdateImage(index, newProperties);
    }
  };

  // テキストクリック時の処理
  const handleTextClick = (index) => {
    setSelectedTextIndex(index);
    setSelectedImageIndex(null);
    onSelectText(index);
  };

  // ステージクリック時の処理
  const handleStageMouseDown = (e) => {
    if (e.target.name() === 'background') {
      resetSelection();
    }
  };

  // モーダルの開閉
  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // トークンの有効期限をチェック
  const checkTokenExpiration = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Failed to parse token:", error);
      return true; // トークンが無効な場合も期限切れとみなす
    }
  };

  // リフレッシュトークンを使用してアクセストークンを更新
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.error("Refresh token is missing.");
      alert("リフレッシュトークンがありません。再度ログインしてください。");
      throw new Error("リフレッシュトークンがありません");
    }

    try {
      const response = await axios.post('/auth/refresh', {
        refresh_token: refreshToken, // サーバーで期待されるキー名で送信
      });
      const newAccessToken = response.data.access_token;
      localStorage.setItem('access_token', newAccessToken); // 新しいアクセストークンを保存
      return newAccessToken;
    } catch (error) {
      console.error("Failed to refresh token:", error.response || error);
      alert("ログインセッションが切れています。再度ログインしてください。");
      throw error;
    }
  };

  // モーダル保存時の処理
  const handleModalSave = async () => {
    try {
      let token = localStorage.getItem('access_token');
      if (!token) {
        console.error("Token is missing!");
        alert("ログイン状態が無効です。再度ログインしてください。");
        return;
      }

      if (checkTokenExpiration(token)) {
        console.log("Token has expired, refreshing...");
        token = await refreshAccessToken();
      }

      console.log("Valid Token being sent:", token);

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // ページ番号の重複を避けるため、動的に設定する場合は以下を使用
      // const pageNumber = await getAvailablePageNumber(2); // 例: book_id=2の場合

      const payload = {
        page: { // ページ関連データを 'page' キーでラップ
          book_id: 7, // 適切な book_id を設定
          page_number: 3, // 適切な page_number を設定（重複しないように）
          content: {
            title: modalData.title,
            author: modalData.author,
            tags: modalData.tags,
            texts: texts,
            images: images,
            backgroundColor: backgroundColor,
            visibility: modalData.visibility,
          },
          page_elements_attributes: [
            ...texts.map(text => ({
              element_type: 'text',
              content: {
                text: text.text,
                font_size: text.fontSize,
                font_color: text.color,
                position_x: text.x,
                position_y: text.y,
              },
            })),
            ...images.map(image => ({
              element_type: 'image',
              content: {
                src: image.src,
                width: image.width,
                height: image.height,
                position_x: image.x,
                position_y: image.y,
              },
            })),
          ],
          visibility: modalData.visibility,
        }
      };

      console.log('Payload being sent:', payload);

      const response = await axios.post('/api/v1/pages', payload, { headers });
      console.log('Book saved successfully:', response.data);
      alert('保存が完了しました');
      closeModal();
    } catch (error) {
      console.error('Failed to save book:', error.response || error);
      if (error.response?.data?.errors) {
        const errorMessage = error.response.data.errors.join(", ");
        alert(`保存エラー: ${errorMessage}`);
      } else {
        alert('保存中にエラーが発生しました');
      }
    }
  };

  // モーダルデータの更新関数
  const handleModalChange = (field, value) => {
    updateModalDataField(field, value);
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
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={() => openModal("complete")} className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80">
          完成
        </button>
        <button onClick={() => openModal("draft")} className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80">
          下書き保存
        </button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleModalSave}
        modalType={modalType}
        title={modalData.title}
        setTitle={(value) => handleModalChange("title", value)}
        author={modalData.author}
        setAuthor={(value) => handleModalChange("author", value)}
        tags={modalData.tags}
        setTags={(value) => handleModalChange("tags", value)}
        visibility={modalData.visibility}
        setVisibility={(value) => handleModalChange("visibility", value)}
      />
    </div>
  );
}

export default Canvas;

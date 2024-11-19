"use client";

import React, { useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Image as KonvaImage } from 'react-konva';
import axios from '../../api/axios';
import Modal from './Modal';
import useCanvasStore from '../../stores/canvasStore';
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";

function Canvas() {
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
    pages,
    currentPageIndex,
    addPage,
    setCurrentPageIndex,
    deleteText,
    deleteImage,
  } = useCanvasStore();

  const transformerRef = useRef(null);
  const stageRef = useRef(null);
  const textRefs = useRef([]);
  const imageRefs = useRef([]);

  const stageWidth = typeof window !== "undefined" ? window.innerWidth * 0.8 : 800;
  const stageHeight = stageWidth * 0.75;


  // ページの初期化と安全な取得
  const currentPageIndexIsValid =
    currentPageIndex >= 0 && currentPageIndex < pages.length;

  const currentPage = currentPageIndexIsValid
    ? pages[currentPageIndex]
    : {
        content: {
          texts: [],
          images: [],
          backgroundColor: '#ffffff',
        },
        book_id: 1,
        page_number: pages.length + 1,
      };

  // デバッグ用ログ
  console.log("Current pages:", pages);
  console.log("Current page index:", currentPageIndex);
  console.log("Current page:", currentPage);
  console.log("Current Page Images:", currentPage.content.images);

  // 新しいページを追加する関数
  const handleAddPage = async () => {
    try {
      let token = localStorage.getItem('access_token');
      if (!token) {
        console.error("Token is missing!");
        alert("ログイン状態が無効です。再度ログインしてください。");
        return;
      }

      // トークンの有効期限を確認してリフレッシュ
      if (checkTokenExpiration(token)) {
        console.log("Token has expired, refreshing...");
        token = await refreshAccessToken();
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const newPageNumber = pages.length > 0 ? Math.max(...pages.map(p => p.page_number)) + 1 : 1;

      // 新しいページのデータを構築
      const newPage = {
        book_id: currentPage.book_id || 1, // 適切な book_id を設定
        page_number:  newPageNumber,
        content: {
          title: '',
          author: '',
          tags: [],
          backgroundColor: '#ffffff',
          visibility: 'public',
          texts: [],
          images: [],
        },
        page_elements_attributes: [],
        page_characters_attributes: [],
      };

      // ページ追加APIを呼び出す
      const payload = { page: newPage };
      const response = await axios.post(`/api/v1/books/${currentPage.book_id}/pages`, payload, { headers });

      const savedPage = response.data.page;

      // ストアに新しいページを追加
      addPage(savedPage);
      alert('新しいページが追加されました');
    } catch (error) {
      console.error('Failed to add page:', error.response || error);
      if (error.response?.data?.errors) {
        const errorMessage = error.response.data.errors.join(", ");
        alert(`ページ追加エラー: ${errorMessage}`);
      } else {
        alert('ページ追加中にエラーが発生しました');
      }
    }
  };

  // 画像の読み込み
  // 画像の読み込み
useEffect(() => {
  let isMounted = true; // マウント状態を追跡

  const loadImages = async () => {
    const promises = currentPage.content.images.map((img) => {
      return new Promise((resolve) => {
        const image = new window.Image();
        image.src = img.src;
        image.onload = () => resolve({ ...img, image });
        image.onerror = () => resolve(null); // エラーハンドリング
      });
    });
    const results = await Promise.all(promises);
    const validResults = results.filter(Boolean); // 有効な画像だけを保持
    if (isMounted) {
      // 状態が本当に変わった場合のみ更新
      setLoadedImages((prev) => {
        const isSame =
          prev.length === validResults.length &&
          prev.every((img, i) => img.src === validResults[i]?.src);
        return isSame ? prev : validResults;
      });
    }
  };

  if (currentPage.content.images.length > 0) {
    loadImages();
  }

  return () => {
    isMounted = false; // クリーンアップ
  };
}, [currentPage.content.images]); // `currentPage.content.images` のみを依存関係に


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
    if (type === 'text') updateText(index, update);
    else if (type === 'image') updateImage(index, update);
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
      updateText(index, newProperties);
    } else if (type === 'image') {
      updateImage(index, newProperties);
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

      const payload = {
        page: { // ページ関連データを 'page' キーでラップ
          book_id: currentPage.book_id || 1,
          page_number: pages.length + 1, // 新しいページ番号
          content: {
            title: modalData.title,
            author: modalData.author,
            tags: modalData.tags,
            texts: currentPage.content.texts,
            images: currentPage.content.images,
            backgroundColor: currentPage.content.backgroundColor,
            visibility: modalData.visibility,
          },
          page_elements_attributes: [
            ...currentPage.content.texts.map(text => ({
              element_type: 'text',
              content: {
                text: text.text,
                font_size: text.fontSize,
                font_color: text.color,
                position_x: text.x,
                position_y: text.y,
              },
            })),
            ...currentPage.content.images.map(image => ({
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

      const response = await axios.post('/pages', payload, { headers }); // ベースURLが設定されている場合
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
            fill={currentPage.content.backgroundColor}
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
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={() => openModal("complete")} className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80">
          完成
        </button>
        <button onClick={() => openModal("draft")} className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80">
          下書き保存
        </button>
        <button
          onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
          disabled={currentPageIndex === 0}
          className="p-2 text-bodyText flex items-center justify-center"
        >
          <FaChevronCircleLeft size={32} />
        </button>
        <button
          onClick={() => {
            if (currentPageIndex < pages.length - 1) {
              setCurrentPageIndex(currentPageIndex + 1);
            } else {
              handleAddPage();
            }
          }}
          className="p-2 text-bodyText flex items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:text-blue-500 hover:bg-blue-100 hover:shadow-md"
        >
          <FaChevronCircleRight size={32} />
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

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Image as KonvaImage } from 'react-konva';
import Modal from './Modal';
import useCanvasStore from '../../stores/canvasStore';
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import axios from '../../api/axios';
import { useRouter } from 'next/navigation';

function Canvas({ showActionButtons, backgroundColor }) {
  const {
    selectedTextIndex,
    selectedImageIndex,
    isModalOpen,
    modalType,
    modalData,
    setSelectedTextIndex,
    setSelectedImageIndex,
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
    addImage,
    updateImage,
    updateText,
    resetCanvas,
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
    };

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
      const refreshToken = localStorage.getItem('refresh_token');
      if (!token) {
        console.error("Token is missing!");
        alert("ログイン状態が無効です。再度ログインしてください。");
        return;
      };

      if (checkTokenExpiration(token)) {
        console.log("Token has expired, refreshing...");
        token = await refreshAccessToken();
      };

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

       // 新しい書籍を作成
      const newBookData = {
        title: modalData.title,
        author_name: modalData.author,
        description: modalData.description || '', // 必要に応じて追加
        visibility: modalData.visibility === 'public' ? 0 : 1, // enumの値に合わせて
        is_draft: modalType === 'draft',
      };

      const createBookResponse = await axios.post('/api/v1/books', newBookData, { headers });
      const newBookId = createBookResponse.data.book.id;
      console.log(`New book created with id: ${newBookId}`);

      // ページごとに保存
      for (const page of pages) {
        const payload = {
          page: {
            book_id: newBookId,
            page_number: page.page_number,
            content: {
              title: page.content.title,
              author: page.content.author,
              tags: page.content.tags,
              backgroundColor: page.content.backgroundColor,
              visibility: page.content.visibility,
              texts: page.content.texts.map(text => ({
                text: text.text,
                font_size: text.fontSize,
                color: text.color,
                x: text.x,
                y: text.y,
                rotation: text.rotation || 0,
                scaleX: text.scaleX || 1,
                scaleY: text.scaleY || 1,
              })),
              images: page.content.images.map(image => ({
                src: image.src,
                x: image.x,
                y: image.y,
                width: image.width,
                height: image.height,
              })),
            },
            page_elements_attributes: [
              ...page.content.texts.map(text => ({
                element_type: 'text',
                content: {
                  text: text.text,
                  font_size: text.fontSize,
                  font_color: text.color,
                  position_x: text.x,
                  position_y: text.y,
                },
              })),
              ...page.content.images.map(image => ({
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
          }
        };
        await axios.post(`/api/v1/books/${newBookId}/pages`, payload, { headers });
      }
      alert('保存が完了しました');

      // キャンバスをリセット
      resetCanvas();

      closeModal();

      router.push('/index-books');
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
                handleAddPage();
              }
            }}
            className="p-2 text-bodyText flex items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:text-blue-500 hover:bg-blue-100 hover:shadow-md"
          >
            <FaChevronCircleRight size={32} />
          </button>
        </div>
        {showActionButtons && (
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            {/* 完成と下書きボタン */}
            <button
              onClick={() => openModal("complete")}
              className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80"
            >
              完成
            </button>
            <button
              onClick={() => openModal("draft")}
              className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80"
            >
              下書き保存
            </button>
          </div>
        )}
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

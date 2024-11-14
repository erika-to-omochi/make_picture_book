"use client";

import axios from 'axios';
import { useEffect, useState } from 'react';
import Canvas from '../components/Canvas';
import { FaComment, FaEdit, FaTrash, FaPrint } from 'react-icons/fa';

function BookDetailPage({ bookId }) {
  const [bookData, setBookData] = useState(null);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const response = await axios.get(`/api/v1/books/${bookId}`);
        setBookData(response.data);
      } catch (error) {
        console.error("Error fetching book data", error);
      }
    };

    fetchBookData();
  }, [bookId]);

  const handleComment = () => {
    console.log("コメントボタンがクリックされました");
    // コメント機能の実装
  };

  const handleEdit = () => {
    console.log("編集ボタンがクリックされました");
    // 編集機能の実装
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/v1/books/${bookId}`);
      console.log("削除完了しました");
      // 削除後のリダイレクトや状態の更新を行う
    } catch (error) {
      console.error("削除中にエラーが発生しました", error);
    }
  };

  const handlePrint = () => {
    window.print();
    console.log("印刷ボタンがクリックされました");
  };

  if (!bookData) return <p>Loading...</p>;

  return (
    <div>
      <h1>{bookData.title}</h1>
      <p>作者: {bookData.author}</p>
      <p>タグ: {bookData.tags}</p>
      <Canvas
        texts={bookData.texts}
        images={bookData.images}
        backgroundColor={bookData.backgroundColor}
      />
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={handleComment}>
          <FaComment /> コメント
        </button>
        <button onClick={handleEdit}>
          <FaEdit /> 編集
        </button>
        <button onClick={handleDelete}>
          <FaTrash /> 削除
        </button>
        <button onClick={handlePrint}>
          <FaPrint /> 印刷
        </button>
      </div>
    </div>
  );
}

export default BookDetailPage;

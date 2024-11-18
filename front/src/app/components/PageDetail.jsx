// front/src/app/components/PageDetail.jsx
import React, { useEffect, useState } from 'react';
import Canvas from '../../stores/canvasStore'; // パスを適宜調整してください
import axios from '../../api/axios';

const PageDetail = ({ bookId, pageId }) => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await axios.get(`/api/v1/books/${bookId}/pages/${pageId}`);
        setPageData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [bookId, pageId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading page details.</p>;
  if (!pageData) return <p>No page data found.</p>;

  return (
    <div>
      <h2>{pageData.title}</h2>
      <Canvas
        texts={pageData.content.texts}
        images={pageData.content.images}
        backgroundColor={pageData.content.backgroundColor}
        // 編集や削除の関数は後で実装
        onSelectText={() => {}}
        onDeleteText={() => {}}
        onUpdateText={() => {}}
        onDeleteImage={() => {}}
        onUpdateImage={() => {}}
      />
      {/* 他のページ詳細情報を表示する場合はここに追加 */}
    </div>
  );
};

export default PageDetail;

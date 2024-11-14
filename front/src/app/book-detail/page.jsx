"use client"

import axios from 'axios';
import { useEffect, useState } from 'react';
import Canvas from '../components/Canvas';

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
    </div>
  );
}

export default BookDetailPage;

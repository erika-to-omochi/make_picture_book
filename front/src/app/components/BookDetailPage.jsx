"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const Canvas = dynamic(() => import("./Canvas"), { ssr: false });

function BookDetailPage({ initialBookData }) {
  const { bookId } = useParams();
  const [bookData, setBookData] = useState(initialBookData);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  useEffect(() => {
    if (!bookId || bookData) return;

    const fetchBookData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/v1/books/${bookId}`);
        setBookData(response.data);
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };

    fetchBookData();
  }, [bookId, bookData]);

  if (!bookData) return <p>Loading...</p>;

  return (
    <div>
      <h1>{bookData.title}</h1>
      <p>作者: {bookData.author_name}</p>

      {bookData.pages.length > 0 && (
        <Canvas
          texts={bookData.pages[selectedPageIndex].page_elements.filter(
            (el) => el.element_type === "text"
          ).map((el) => el.content)}
          images={bookData.pages[selectedPageIndex].page_elements.filter(
            (el) => el.element_type === "image"
          ).map((el) => el.content)}
          backgroundColor="#ffffff"
        />
      )}

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        {bookData.pages.map((_, index) => (
          <button
            key={`page-btn-${index}`}
            onClick={() => setSelectedPageIndex(index)}
            style={{
              padding: "10px",
              backgroundColor: selectedPageIndex === index ? "#ddd" : "#fff",
              border: "1px solid #ccc",
            }}
          >
            ページ {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default BookDetailPage;

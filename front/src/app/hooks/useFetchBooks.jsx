import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";

function useFetchBooks(myBooks = false) {
  const [books, setBooks] = useState([]); // 絵本データを格納
  const [loading, setLoading] = useState(true); // ローディング状態
  const [error, setError] = useState(null); // エラー状態

  useEffect(() => {
    // APIからデータを取得
    const fetchBooks = async () => {
      try {
        const endpoint = myBooks ? '/api/v1/books/my_books' : '/api/v1/books';
        const response = await axiosInstance.get(endpoint); // `endpoint`を使用
        const sortedBooks = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at) // 新しい順にソート
        );
        setBooks(sortedBooks);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchBooks();
  }, [myBooks]);

  return { books, loading, error };
}

export default useFetchBooks;

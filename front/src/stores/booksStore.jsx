import { create } from 'zustand';
import axiosInstance from '../api/axios';

const useBooksStore = create((set) => ({
  publishedBooks: [], // 公開済みの絵本
  myBooks: [],        // ユーザーの全ての絵本（公開済みと下書き）
  loading: false,
  error: null,

  // 公開済みの絵本をフェッチ
  fetchPublishedBooks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get('/api/v1/books/public_books'); // 修正後の index エンドポイント
      if (Array.isArray(response.data)) {
        const sortedBooks = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        set({ publishedBooks: sortedBooks, loading: false });
      } else {
        throw new Error("Invalid data format for publishedBooks");
      }
    } catch (err) {
      console.error("Error fetching published books:", err);
      set({ error: err.message || "Error fetching published books", loading: false });
    }
  },

  // ユーザーの全ての絵本（公開済みと下書き）をフェッチ
  fetchMyBooks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get('/api/v1/books/my_books');
      if (Array.isArray(response.data)) {
        const sortedBooks = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        set({ myBooks: sortedBooks, loading: false });
      } else {
        throw new Error("Invalid data format for myBooks");
      }
    } catch (err) {
      console.error("Error fetching my books:", err);
      set({ error: err.message || "Error fetching my books", loading: false });
    }
  },
}));

export default useBooksStore;

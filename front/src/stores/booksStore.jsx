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
      const response = await axiosInstance.get('/api/v1/books');
      const sortedBooks = response.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      set({ publishedBooks: sortedBooks, loading: false });
    } catch (err) {
      console.error("Error fetching published books:", err);
      set({ error: err, loading: false });
    }
  },

  // ユーザーの全ての絵本（公開済みと下書き）をフェッチ
  fetchMyBooks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get('/api/v1/books/my_books');
      const sortedBooks = response.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      set({ myBooks: sortedBooks, loading: false });
    } catch (err) {
      console.error("Error fetching my books:", err);
      set({ error: err, loading: false });
    }
  },
}));

export default useBooksStore;

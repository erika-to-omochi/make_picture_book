import { create } from 'zustand';
import axiosInstance from '../api/axios';

const useBooksStore = create((set) => ({
  publishedBooks: [], // 公開済みの絵本
  myBooks: [],
  pagination: {
    current_page: 1,
    next_page: null,
    prev_page: null,
    total_pages: 1,
    total_count: 0,
    limit_value: 9,
  },
  loading: false,
  error: null,
  setPublishedBooks: (books) => set({ publishedBooks: books }),

  // 公開済みの絵本をフェッチ
  fetchPublishedBooks: async (page = 1, perPage = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get('/api/v1/books/public_books', {
        params: { page, per_page: perPage }, // ページネーションパラメータを送信
      });
      if (response.data.books && Array.isArray(response.data.books) && response.data.pagination) {
        const sortedBooks = response.data.books.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        set({
          publishedBooks: sortedBooks,
          pagination: response.data.pagination,
          loading: false,
        });
      } else {
        throw new Error("Invalid data format for publishedBooks");
      }
    } catch (err) {
      console.error("Error fetching published books:", err);
      set({ error: err.message || "Error fetching published books", loading: false });
    }
  },

  // ユーザーの全ての絵本（公開済みと下書き）をフェッチ
  fetchMyBooks: async (page = 1, perPage = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get('/api/v1/books/my_books', {
        params: { page, per_page: perPage },
      });
      if (response.data.books && Array.isArray(response.data.books) && response.data.meta) {
        const sortedBooks = response.data.books.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        set({
          myBooks: sortedBooks,
          pagination: response.data.meta, // 'meta' キーを使用
          loading: false,
        });
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

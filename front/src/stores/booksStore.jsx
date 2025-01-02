import { create } from 'zustand';
import axiosInstance from '../api/axios';

const useBooksStore = create((set, get) => ({
  publishedBooks: [], // 公開済みの絵本
  myBooks: [],
  filteredBooks: [], // フィルタリングされた書籍
  pagination: {
    current_page: 1,
    next_page: null,
    prev_page: null,
    total_pages: 1,
    total_count: 0,
    limit_value: 9,
  },
  searchParams: {
    tags: "",
    title: "",
    author: "",
  },
  isSearching: false,
  loading: false,
  error: null,

  setPublishedBooks: (books) => set({ publishedBooks: books }),

  // 検索パラメータの設定
  setSearchParams: (params) => set({ searchParams: { ...get().searchParams, ...params } }),

  // フィルタリングされた書籍を設定
  setFilteredBooks: (books) => set({ filteredBooks: books }),

  // 検索状態の設定
  setIsSearching: (isSearching) => set({ isSearching }),

  // 公開済みの絵本をフェッチ
  fetchPublishedBooks: async (page = 1, perPage = 10, tags = null) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get('/api/v1/books/public_books', {
        params: { page, per_page: perPage, tags }, // ページネーションパラメータを送信
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

  // 検索機能
searchBooks: async () => {
  const { tags, title, author } = get().searchParams;
  set({ isSearching: true, loading: true, error: null });
  try {
    const params = {
      page: 1,
      per_page: get().pagination.limit_value,
    };
    if (tags) params.tags = tags;
    if (title.trim()) params.title = title.trim();
    if (author.trim()) params.author = author.trim();

    const response = await axiosInstance.get('/api/v1/books', { params });
    const books = response.data.books;
    const pagination = response.data.pagination || response.data.meta;

    // 数値型に変換
    const currentPage = Number(pagination.current_page);
    const limitValue = Number(pagination.limit_value);

    if (books && Array.isArray(books) && pagination && !isNaN(currentPage) && !isNaN(limitValue)) {
      const sortedBooks = books.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      set({
        filteredBooks: sortedBooks,
        pagination: {
          ...pagination,
          current_page: currentPage,
          limit_value: limitValue,
        },
        loading: false,
        isSearching: true,
      });
    } else {
      throw new Error("Invalid data format for searchBooks");
    }
  } catch (err) {
    console.error("Error searching books:", err);
    set({ error: err.message || "Error searching books", loading: false, isSearching: false });
  }
},

  // 検索のリセット
  resetSearch: () => {
    set({
      searchParams: { tags: "", title: "", author: "" },
      filteredBooks: get().publishedBooks,
      pagination: {
        ...get().pagination,
        current_page: 1,
        next_page: null,
        prev_page: null,
        total_pages: 1,
        total_count: get().publishedBooks.length,
      },
      error: null,
      isSearching: false,
    });
  },
}));

export default useBooksStore;

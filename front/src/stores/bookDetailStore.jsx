// front/src/stores/bookDetailStore.jsx
import { create } from 'zustand';
import axios from '../api/axios';

const useBookDetailStore = create((set, get) => ({
  // 状態
  bookData: null,
  selectedPageIndex: 0,
  images: [],
  texts: [],

  // 状態を更新するアクション
  setBookData: (data) => set({ bookData: data }),
  setSelectedPageIndex: (index) => set({ selectedPageIndex: index }),
  setImages: (images) => set({ images }),
  setTexts: (texts) => set({ texts }),

  // 画像を更新するアクション
  updateImage: (index, updatedProperties) =>
    set((state) => ({
      images: state.images.map((img, i) =>
        i === index ? { ...img, ...updatedProperties } : img
      ),
    })),

  // 画像を削除するアクション
  deleteImage: (index) =>
    set((state) => ({
      images: state.images.filter((_, i) => i !== index),
    })),

  // テキストを更新するアクション
  updateText: (index, updatedProperties) =>
    set((state) => ({
      texts: state.texts.map((text, i) =>
        i === index ? { ...text, ...updatedProperties } : text
      ),
    })),

  // テキストを削除するアクション
  deleteText: (index) =>
    set((state) => ({
      texts: state.texts.filter((_, i) => i !== index),
    })),

  // データをフェッチするアクション
  fetchBookData: async (bookId) => {
    if (get().bookData) return; // 既にデータが存在する場合はフェッチしない
    try {
      const response = await axios.get(`/api/v1/books/${bookId}`);
      set({ bookData: response.data });
    } catch (error) {
      console.error('Error fetching book data:', error);
    }
  },
}));

export default useBookDetailStore;

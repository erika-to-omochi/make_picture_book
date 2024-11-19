import { create } from 'zustand';
import axios from '../api/axios';

const useCanvasStore = create((set, get) => ({
  // 状態
  selectedTextIndex: null,
  selectedImageIndex: null,
  bookData: null,
  isModalOpen: false,
  modalType: null,
  modalData: {
    title: "",
    author: "",
    tags: "",
    visibility: "public",
  },
  pages: [], // ページ状態を追加
  currentPageIndex: 0,

  // アクション
  addPage: (page) => set((state) => ({
    pages: [...state.pages, page],
    currentPageIndex: state.pages.length, // 新しいページに移動
  })),

  fetchBookData: async (bookId) => {
    if (get().bookData) return;
    try {
      const response = await axios.get(`/api/v1/books/${bookId}`);
      set({ bookData: response.data });
    } catch (error) {
      console.error("Failed to fetch book data:", error);
    }
  },
  setSelectedTextIndex: (index) => set({ selectedTextIndex: index }),
  setSelectedImageIndex: (index) => set({ selectedImageIndex: index }),
  setLoadedImages: (images) => set({ loadedImages: images }),
  setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  setModalType: (type) => set({ modalType: type }),
  setModalData: (data) => set({ modalData: { ...data } }),
  updateModalDataField: (field, value) =>
    set((state) => ({
      modalData: { ...state.modalData, [field]: value },
    })),
  resetSelection: () =>
    set({ selectedTextIndex: null, selectedImageIndex: null }),
  setBookData: (data) => set({ bookData: data }),
  setCurrentPageIndex: (index) => set({ currentPageIndex: index }),

  updateText: (index, newProperties) =>
    set((state) => {
      const currentPage = state.pages[state.currentPageIndex];
      const updatedTexts = currentPage.content.texts.map((text, i) =>
        i === index ? { ...text, ...newProperties } : text
      );
      const updatedPages = [...state.pages];
      updatedPages[state.currentPageIndex] = {
        ...currentPage,
        content: {
          ...currentPage.content,
          texts: updatedTexts,
        },
      };
      return { pages: updatedPages };
    }),

  updateImage: (index, newProperties) =>
    set((state) => {
      const currentPage = state.pages[state.currentPageIndex];
      const updatedImages = currentPage.content.images.map((img, i) =>
        i === index ? { ...img, ...newProperties } : img
      );
      const updatedPages = [...state.pages];
      updatedPages[state.currentPageIndex] = {
        ...currentPage,
        content: {
          ...currentPage.content,
          images: updatedImages,
        },
      };
      return { pages: updatedPages };
    }),

  deleteText: (index) =>
    set((state) => {
      const currentPage = state.pages[state.currentPageIndex];
      const updatedTexts = currentPage.content.texts.filter((_, i) => i !== index);
      const updatedPages = [...state.pages];
      updatedPages[state.currentPageIndex] = {
        ...currentPage,
        content: {
          ...currentPage.content,
          texts: updatedTexts,
        },
      };
      return { pages: updatedPages };
    }),

  deleteImage: (index) =>
    set((state) => {
      const currentPage = state.pages[state.currentPageIndex];
      const updatedImages = currentPage.content.images.filter((_, i) => i !== index);
      const updatedPages = [...state.pages];
      updatedPages[state.currentPageIndex] = {
        ...currentPage,
        content: {
          ...currentPage.content,
          images: updatedImages,
        },
      };
      return { pages: updatedPages };
    }),

  setPages: (pages) => set({ pages }), // ページ状態を設定するアクションを追加
}));

export default useCanvasStore;

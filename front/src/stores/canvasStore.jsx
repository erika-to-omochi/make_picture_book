import { create } from 'zustand';
import axios from '../api/axios';

const useCanvasStore = create((set, get) => ({
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
  pages: [
    {
      content: {
        images: [],
        texts: [],
        backgroundColor: '#ffffff', // 初期背景色
      },
      book_id: 1, // 初期book_id
      page_number: 1, // 初期ページ番号
    },
  ], // 初期ページを追加
  currentPageIndex: 0,

  // アクション
  addImage: (imageSrc) => {
    const img = new window.Image(); // 新しい Image オブジェクトを作成
    img.src = imageSrc;
    img.onload = () => {
      console.log("Image loaded successfully:", imageSrc);
      set((state) => {
        console.log("set is called");
        console.log("State before adding image:", state);
        const currentPage = state.pages[state.currentPageIndex];
        if (!currentPage) {
          console.error("No current page to add image");
          return {};
        }
        const newImage = {
          src: imageSrc,
          x: 100, // 初期位置を調整
          y: 100,
          width: img.naturalWidth / 2,
          height: img.naturalHeight / 2,
        };
        const updatedPages = [...state.pages];
        updatedPages[state.currentPageIndex] = {
          ...currentPage,
          content: {
            ...currentPage.content,
            images: [...currentPage.content.images, newImage],
          },
        };
        console.log("Updated pages:", updatedPages);
        return { pages: updatedPages };
      });
    };
    img.onerror = () => {
      console.error("Failed to load image:", imageSrc);
    };
  },

    // 新しいテキストを追加するアクション
    addText: (newText) => {
      set((state) => {
        const currentPage = state.pages[state.currentPageIndex];
        if (!currentPage) {
          console.error("No current page to add text");
          return {};
        }
        const updatedPages = [...state.pages];
        updatedPages[state.currentPageIndex] = {
          ...currentPage,
          content: {
            ...currentPage.content,
            texts: [...currentPage.content.texts, newText],
          },
        };
        return { pages: updatedPages };
      });
    },

  // ページの追加
  addPage: (newPage) => {
  set((state) => ({
    pages: [...state.pages, newPage],
    currentPageIndex: state.pages.length, // 新しいページに移動
  }));
},


fetchBookData: async (bookId) => {
  if (get().bookData) return;
  try {
    const response = await axios.get(`/api/v1/books/${bookId}`);
    const fetchedBookData = response.data;

    // `pages` の構造を確認し、必要に応じて整形
    if (fetchedBookData.pages && Array.isArray(fetchedBookData.pages)) {
      const formattedPages = fetchedBookData.pages.map((page) => ({
        content: {
          images: page.content.images || [],
          texts: page.content.texts || [],
          backgroundColor: page.content.backgroundColor || '#ffffff',
        },
        book_id: page.book_id || 1,
        page_number: page.page_number || 1,
      }));
      set({ pages: formattedPages, bookData: fetchedBookData });
    } else {
      console.error("Fetched pages data is invalid:", fetchedBookData.pages);
    }
  } catch (error) {
    console.error("Failed to fetch book data:", error);
  }
},

  setSelectedTextIndex: (index) => set({ selectedTextIndex: index }),
  setSelectedImageIndex: (index) => set({ selectedImageIndex: index }),
  // setLoadedImages: (images) => set({ loadedImages: images }), // 削除
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

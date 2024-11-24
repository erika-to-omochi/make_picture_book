import { create } from 'zustand';
import axios from '../api/axios';

const useCanvasStore = create((set, get) => ({
  selectedTextIndex: null,
  selectedImageIndex: null,
  bookData: null,
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

  //画像はここ
  handleAddImage: (imageSrc) => {
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      set((state) => {
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

  setSelectedImageIndex: (index) => set({ selectedImageIndex: index }),

    // テキストはここ
    handleAddText: (newText) => {
      set((state) => {
        const currentPage = state.pages[state.currentPageIndex];
        if (!currentPage) {
          console.error("No current page to add text");
          return {};
        }
        const textWithPosition = {
          ...newText,
          x: 100,
          y: 100,
        };
        const updatedPages = [...state.pages];
        updatedPages[state.currentPageIndex] = {
          ...currentPage,
          content: {
            ...currentPage.content,
            texts: [...currentPage.content.texts, textWithPosition],
          },
        };
        return { pages: updatedPages };
      });
    },

    handleUpdateText: (updatedText) =>
    set((state) => {
      const index = state.selectedTextIndex;
      if (index !== null && index !== undefined) {
        const currentPage = state.pages[state.currentPageIndex];
        const updatedTexts = currentPage.content.texts.map((text, i) =>
          i === index ? { ...text, ...updatedText } : text
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
      }
      return {};
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

    setSelectedTextIndex: (index) => set({ selectedTextIndex: index }),


  // ページはここ
  addPage: () => {
    set((state) => {
      const newPage = {
        content: {
          texts: [], // テキスト初期化
          images: [], // 画像初期化
          backgroundColor: '#ffffff', // 背景色の初期値
        },
        book_id: state.bookData?.id || 1, // 必要に応じて book_id を設定
        page_number: state.pages.length + 1, // ページ番号を設定
      };
      const updatedPages = [...state.pages, newPage];
      return {
        pages: updatedPages,
        currentPageIndex: updatedPages.length - 1, // 新しいページに移動
      };
    });
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

// モーダルはここ
  resetSelection: () =>
    set({ selectedTextIndex: null, selectedImageIndex: null }),
  setBookData: (data) => set({ bookData: data }),
  setCurrentPageIndex: (index) => set({ currentPageIndex: index }),

  setBackgroundColor: (color) => set((state) => {
    console.log("setBackgroundColor called with color:", color);
    const currentPage = state.pages[state.currentPageIndex];
    if (!currentPage) {
      console.error("No current page to set background color");
      return {};
    }
    const updatedPages = [...state.pages];
    updatedPages[state.currentPageIndex] = {
      ...currentPage,
      content: {
        ...currentPage.content,
        backgroundColor: color,
      },
    };
    console.log("Updated Pages:", updatedPages);
    return { pages: updatedPages };
  }),

    resetCanvas: () => set({
      selectedTextIndex: null,
      selectedImageIndex: null,
      pages: [
        {
          content: {
            images: [],
            texts: [],
            backgroundColor: '#ffffff',
          },
          book_id: 1,
          page_number: 1,
        },
      ],
      currentPageIndex: 0,
    }),

  setPages: (pages) => set({ pages }), // ページ状態を設定するアクションを追加
}));

export default useCanvasStore;

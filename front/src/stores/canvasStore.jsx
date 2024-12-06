import { create } from 'zustand';
import axiosInstance from '../api/axios';

const useCanvasStore = create((set, get) => ({
  selectedTextIndex: null,
  selectedImageIndex: null,
  bookData: null,
  pages: [
    {
      bookId: 1,
      pageNumber: 1,
      backgroundColor: '#ffffff',
      pageElements: [],
      pageCharacters: [],
      id: null,
    },
  ],
  currentPageIndex: 0,
  history: [],

  // 現在の状態を履歴に追加
  pushToHistory: () => {
    const { pages, bookData, currentPageIndex } = get();
    set((state) => ({
      history: [
        ...state.history,
        {
          pages: JSON.parse(JSON.stringify(pages)),
          bookData: JSON.parse(JSON.stringify(bookData)),
          currentPageIndex,
        },
      ].slice(-20), // 履歴を20ステートに制限（必要に応じて調整）
    }));
  },

  // 履歴から1つ前の状態に戻す
  undo: () => {
    set((state) => {
      const newHistory = [...state.history];
      if (newHistory.length === 0) {
        console.warn("履歴がありません。");
        return {};
      }
      const previousState = newHistory.pop();
      return {
        pages: previousState.pages,
        bookData: previousState.bookData,
        currentPageIndex: previousState.currentPageIndex,
        history: newHistory,
        selectedTextIndex: null,
        selectedImageIndex: null,
      };
    });
  },

  // アクション
  //画像はここ
  handleAddImage: (imageSrc) => {
    get().pushToHistory();
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      set((state) => {
        const currentPage = state.pages[state.currentPageIndex];
        if (!currentPage) {
          console.error("No current page to add image");
          return {};
        }
        const newImageElement = {
          elementType: 'image',
          src: imageSrc,
          positionX: 100, // 初期位置を調整
          positionY: 100,
          rotation: 0,
          scaleX: 0.5, // スケールファクターとして初期化
          scaleY: 0.5,
        };
        const updatedPages = [...state.pages];
        updatedPages[state.currentPageIndex] = {
          ...currentPage,
          pageElements: [...currentPage.pageElements, newImageElement],
        };
        console.log("Updated pages:", updatedPages);
        return { pages: updatedPages };
      });
    };
    img.onerror = () => {
      console.error("Failed to load image:", imageSrc);
    };
  },

  updateImage: (index, newProperties) => {
  get().pushToHistory();
  set((state) => {
    const currentPage = state.pages[state.currentPageIndex];
    if (!currentPage) {
      console.error("No current page to update image");
      return {};
    }
    const updatedElements = currentPage.pageElements.map((element, i) =>
      i === index && element.elementType === 'image'
        ? { ...element, ...newProperties }
        : element
    );

    const updatedPages = [...state.pages];
    updatedPages[state.currentPageIndex] = {
      ...currentPage,
      pageElements: updatedElements,
    };
    return { pages: updatedPages };
  });
},

  deleteImage: (index) => {
    get().pushToHistory();
    set((state) => {
      const currentPage = state.pages[state.currentPageIndex];
      if (!currentPage) {
        console.error("No current page to delete image");
        return {};
      }
      const updatedElements = currentPage.pageElements.filter((el, i) => !(i === index && el.elementType === 'image'));
      const updatedPages = [...state.pages];
      updatedPages[state.currentPageIndex] = {
        ...currentPage,
        pageElements: updatedElements,
      };
      return { pages: updatedPages };
    });
  },
  setSelectedImageIndex: (index) => set({ selectedImageIndex: index }),

    // テキストはここ
    handleAddText: (newText) => {
      get().pushToHistory();
      const currentPage = get().pages[get().currentPageIndex];
      if (!currentPage) {
        console.error("No current page to add text");
        return undefined;
      }
      const newIndex = currentPage.pageElements.length;
      set((state) => {
        const newTextElement = {
          elementType: 'text',
          text: newText.text,
          fontSize: newText.fontSize,
          fontColor: newText.fontColor,
          positionX: newText.positionX || 100,
          positionY: newText.positionY || 400,
          rotation: newText.rotation || 0,
          scaleX: newText.scaleX || 1,
          scaleY: newText.scaleY || 1,
        };
        const updatedPages = [...state.pages];
        updatedPages[state.currentPageIndex] = {
          ...currentPage,
          pageElements: [...currentPage.pageElements, newTextElement],
        };
        return { pages: updatedPages };
      });
      return newIndex;
    },

    handleUpdateText: (index, newProperties) => {
      get().pushToHistory();
      set((state) => {
        const currentPage = state.pages[state.currentPageIndex];
        if (!currentPage) {
          console.error("No current page to update text");
          return {};
        }
        const updatedElements = currentPage.pageElements.map((element, i) =>
          i === index && element.elementType === 'text'
            ? { ...element, ...newProperties }
            : element
        );
        const updatedPages = [...state.pages];
        updatedPages[state.currentPageIndex] = {
          ...currentPage,
          pageElements: updatedElements,
        };
        return { pages: updatedPages };
      });
    },

    deleteText: (index) => {
      get().pushToHistory();
      set((state) => {
        const currentPage = state.pages[state.currentPageIndex];
        if (!currentPage) {
          console.error("No current page to delete text");
          return {};
        }
        const updatedElements = currentPage.pageElements.filter((el, i) => !(i === index && el.elementType === 'text'));
        const updatedPages = [...state.pages];
        updatedPages[state.currentPageIndex] = {
          ...currentPage,
          pageElements: updatedElements,
        };
        return { pages: updatedPages };
      });
    },

    setSelectedTextIndex: (index) => set({ selectedTextIndex: index }),


  // ページはここ
  addPage: () => {
    get().pushToHistory();
    set((state) => {
      const newPage = {
        bookId: state.bookData?.id || 1,
        pageNumber: state.pages.length + 1,
        backgroundColor: '#ffffff',
        pageElements: [],
        pageCharacters: [],
        id: null,
      };
      const updatedPages = [...state.pages, newPage];
      return {
        pages: updatedPages,
        currentPageIndex: updatedPages.length - 1,
      };
    });
  },

  // データ取得
  fetchBookData: async (bookId) => {
    if (get().bookData) return;
    try {
      const response = await axiosInstance.get(`/api/v1/books/${bookId}/`);
      if (response.data && Array.isArray(response.data.pages)) {
        const formattedPages = response.data.pages.map((page) => ({
          pageNumber: page.page_number,
          bookId: page.book_id || 1,
          id: page.id || null,
          backgroundColor: page.background_color || "#ffffff",
          pageElements: (page.page_elements || []).map((element) => ({
            ...element,
            elementType: element.element_type,
            fontSize: element.font_size,
            fontColor: element.font_color,
            positionX: element.position_x,
            positionY: element.position_y,
            scaleX: element.scale_x,
            scaleY: element.scale_y,
          })),
          pageCharacters: page.page_characters || [],
        }));
        set({ pages: formattedPages, bookData: response.data });
      } else {
        console.error("Fetched pages data is invalid:", response.data.pages);
        set({ pages: [] });
      }
    } catch (error) {
      console.error("Failed to fetch book data:", error);
      set({ pages: [] });
    }
  },

// モーダルはここ
  resetSelection: () =>
    set({ selectedTextIndex: null, selectedImageIndex: null }),
  setBookData: (data) => set({ bookData: data }),
  setCurrentPageIndex: (index) => set({ currentPageIndex: index }),

  setBackgroundColor: (color) => set((state) => {
    get().pushToHistory();
    const currentPage = state.pages[state.currentPageIndex];
    if (!currentPage) {
      console.error("No current page to set background color");
      return {};
    }
    const updatedPages = [...state.pages];
    updatedPages[state.currentPageIndex] = {
      ...currentPage,
      backgroundColor: color,
    };
    return { pages: updatedPages };
  }),

  resetCanvas: () => set({
    selectedTextIndex: null,
    selectedImageIndex: null,
    bookData: null,
    pages: [
      {
        bookId: 1,
        pageNumber: 1,
        backgroundColor: '#ffffff',
        pageElements: [],
        pageCharacters: [],
        id: null,
      },
    ],
    currentPageIndex: 0,
  }),

  setPages: (pages) => set({ pages }), // ページ状態を設定するアクションを追加
}));

export default useCanvasStore;

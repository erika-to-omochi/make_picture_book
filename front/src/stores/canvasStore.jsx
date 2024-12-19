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
      elementsToDelete: [],
      id: null,
      elementsToDelete: [],
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

  // 画像の追加（handleAddImage）
  handleAddImage: (imageData) => {
    return new Promise((resolve, reject) => {
      get().pushToHistory();
      const img = new window.Image();
      img.src = imageData.src;
      img.onload = () => {
        set((state) => {
          const currentPage = state.pages[state.currentPageIndex];
          if (!currentPage) {
            console.error("現在のページが見つかりません。");
            return {};
          }
          const newImageElement = {
            elementType: 'image',
            src: imageData.src,
            positionX: imageData.positionX || 100,
            positionY: imageData.positionY || 100,
            rotation: imageData.rotation || 0,
            scaleX: imageData.scaleX || 0.5,
            scaleY: imageData.scaleY || 0.5,
            imageCategory: imageData.imageCategory || 'default',
            id: get().generateUniqueId(),
          };
          const updatedPageElements = [...currentPage.pageElements, newImageElement];
          const updatedPages = [...state.pages];
          updatedPages[state.currentPageIndex] = {
            ...currentPage,
            pageElements: updatedPageElements,
          };
          set({ pages: updatedPages });
          return { pages: updatedPages };
        });
        const newIndex = get().pages[get().currentPageIndex].pageElements.length - 1;
        resolve(newIndex);
      };
      img.onerror = () => {
        console.error("画像の読み込みに失敗しました:", imageData.src);
        reject(new Error("画像の読み込みに失敗しました。"));
      };
    });
  },

  // 画像の更新
  updateImage: (index, newProperties) => {
    get().pushToHistory();
    set((state) => {
      const currentPage = state.pages[state.currentPageIndex];
      if (!currentPage) {
        console.error("現在のページが見つかりません。");
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

  // 画像の削除
  deleteImage: (index) => {
    get().pushToHistory();
    set((state) => {
      const currentPage = state.pages[state.currentPageIndex];
      if (!currentPage) {
        console.error("現在のページが見つかりません。");
        return {};
      }
      const element = currentPage.pageElements[index];
      if (element && element.id) {
        const updatedElementsToDelete = [
          ...(currentPage.elementsToDelete || []), // 配列でない場合に空配列をデフォルト値とする
          { id: element.id },
        ];
        currentPage.elementsToDelete = updatedElementsToDelete; // ページに直接設定
      }
      const updatedElements = currentPage.pageElements.filter((el, i) => !(i === index && el.elementType === 'image'));
      const updatedPages = [...state.pages];
      updatedPages[state.currentPageIndex] = {
        ...currentPage,
        pageElements: updatedElements,
        elementsToDelete: currentPage.elementsToDelete, // 更新済み
      };
      return { pages: updatedPages };
    });
  },

  setSelectedImageIndex: (index) => set({ selectedImageIndex: index }),

  // テキストの追加
  handleAddText: (newText) => {
    get().pushToHistory();
    const currentPage = get().pages[get().currentPageIndex];
    if (!currentPage) {
      console.error("現在のページが見つかりません。");
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
        id: get().generateUniqueId(),
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

  // テキストの更新
  handleUpdateText: (index, newProperties) => {
    get().pushToHistory();
    set((state) => {
      const currentPage = state.pages[state.currentPageIndex];
      if (!currentPage) {
        console.error("現在のページが見つかりません。");
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

  // テキストの削除
  deleteText: (index) => {
    get().pushToHistory();
    set((state) => {
      const currentPage = state.pages[state.currentPageIndex];
      if (!currentPage) {
        console.error("現在のページが見つかりません。");
        return {};
      }
      const element = currentPage.pageElements[index];
      if (element && element.id) {
        // 既存の要素を削除対象リストに追加
        const updatedElementsToDelete = [...currentPage.elementsToDelete, { id: element.id }];
        currentPage.elementsToDelete = updatedElementsToDelete; // ページに直接設定
      }
      const updatedElements = currentPage.pageElements.filter((el, i) => !(i === index && el.elementType === 'text'));
      const updatedPages = [...state.pages];
      updatedPages[state.currentPageIndex] = {
        ...currentPage,
        pageElements: updatedElements,
        elementsToDelete: currentPage.elementsToDelete, // 更新済み
      };
      return { pages: updatedPages };
    });
  },

  setSelectedTextIndex: (index) => set({ selectedTextIndex: index }),

  // キャラクターを追加するアクション
  addCharacter: (characterData) => {
    get().pushToHistory(); // 履歴に追加
    set((state) => {
      const currentPage = state.pages[state.currentPageIndex];
      if (!currentPage) {
        console.error("現在のページが見つかりません。");
        return {};
      }
      const newCharacter = {
        id: get().generateUniqueId(),
        parts: characterData.parts || [], // [{src: ..., x, y, ...}, ...]
        positionX: characterData.positionX || 100,
        positionY: characterData.positionY || 100,
        scaleX: characterData.scaleX || 1,
        scaleY: characterData.scaleY || 1,
        rotation: characterData.rotation || 0,
      };
      console.log("Adding character:", newCharacter);
      const updatedCharacters = [...currentPage.pageCharacters, newCharacter];
      const updatedPages = [...state.pages];
      updatedPages[state.currentPageIndex] = {
        ...currentPage,
        pageCharacters: updatedCharacters,
      };
      return { pages: updatedPages };
    });
  },

  // キャラクターを更新するアクション（idで特定する想定）
  updateCharacter: (characterId, newProperties) => {
    get().pushToHistory();
    set((state) => {
      const currentPage = state.pages[state.currentPageIndex];
      if (!currentPage) return {};
      const updatedCharacters = currentPage.pageCharacters.map(char => {
        if (char.id === characterId) {
          return { ...char, ...newProperties };
        }
        return char;
      });
      const updatedPages = [...state.pages];
      updatedPages[state.currentPageIndex] = {
        ...currentPage,
        pageCharacters: updatedCharacters,
      };
      return { pages: updatedPages };
    });
  },

  // キャラクターを削除するアクション
  deleteCharacter: (characterId) => {
    get().pushToHistory();

    set((state) => {
      const currentPage = state.pages[state.currentPageIndex];
      if (!currentPage) return {};

      const updatedCharacters = currentPage.pageCharacters.filter((char) => char.id !== characterId);

      const updatedPages = [...state.pages];
      updatedPages[state.currentPageIndex] = {
        ...currentPage,
        pageCharacters: updatedCharacters,
      };
      return { pages: updatedPages };
    });
  },

  setSelectedCharacterIndex: (index) => set({ selectedCharacterIndex: index }),

  // ページの追加
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
        elementsToDelete: [],
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
          elementsToDelete: [],
        }));
        set({ pages: formattedPages, bookData: response.data });
      } else {
        console.error("取得したページデータが無効です:", response.data.pages);
        set({ pages: [] });
      }
    } catch (error) {
      console.error("ブックデータの取得に失敗しました:", error);
      set({ pages: [] });
    }
  },

  // 更新後に削除リストをクリアするアクション
  clearElementsToDelete: () => {
    set((state) => ({
      pages: state.pages.map((page) => ({
        ...page,
        elementsToDelete: [],
      })),
    }));
  },

  // モーダル関連
  resetSelection: () =>
    set({ selectedTextIndex: null, selectedImageIndex: null }),
  setBookData: (data) => set({ bookData: data }),
  setCurrentPageIndex: (index) => set({ currentPageIndex: index }),

  setBackgroundColor: (color) => set((state) => {
    get().pushToHistory();
    const currentPage = state.pages[state.currentPageIndex];
    if (!currentPage) {
      console.error("現在のページが見つかりません。");
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

  // ユーティリティ関数
  generateUniqueId: () => '_' + Math.random().toString(36).substr(2, 9),
}));

export default useCanvasStore;

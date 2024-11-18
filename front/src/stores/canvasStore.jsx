import { create } from 'zustand';

const useCanvasStore = create((set) => ({
  // 選択されたテキストと画像のインデックス
  selectedTextIndex: null,
  selectedImageIndex: null,

  // 読み込まれた画像
  loadedImages: [],

  // モーダルの状態
  isModalOpen: false,
  modalType: null,
  modalData: {
    title: "",
    author: "",
    tags: "",
    visibility: "public",
  },

  // 状態を更新するアクション
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
  resetSelection: () => set({ selectedTextIndex: null, selectedImageIndex: null }),
}));

export default useCanvasStore;

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      userName: null,
      isLoggedIn: false,
      loginMessage: null,
      accessToken: null,
      refreshToken: null,
      isHydrated: false, // ハイドレーション完了フラグ

      login: (name, accessToken, refreshToken) => {
        set({ userName: name, isLoggedIn: true, accessToken, refreshToken });
      },

      logout: () => {
        set({ userName: null, isLoggedIn: false, accessToken: null, refreshToken: null });
      },

      showLoginMessage: (name) => {
        set({ loginMessage: `ようこそ ${name} さん` });
        setTimeout(() => set({ loginMessage: null }), 3000);
      },

      setUserName: (name) => set({ userName: name, isLoggedIn: Boolean(name) }),
      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
      setHydrated: () => set({ isHydrated: true }), // ハイドレーション完了を設定するメソッド
    }),
    {
      name: 'auth-storage', // localStorageのキー名
      getStorage: () => localStorage, // ストレージとしてlocalStorageを使用
      onRehydrateStorage: () => (state) => {
        if (state) {
          // ハイドレーション完了を設定
          setTimeout(() => {
            useAuthStore.getState().setHydrated();
          }, 0);
        }
      },
    }
  )
);

export default useAuthStore;

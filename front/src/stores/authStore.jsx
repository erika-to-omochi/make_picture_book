'use client';

import { create } from 'zustand';

const useAuthStore = create((set) => {
  const storedUserName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;

  return {
    userName: storedUserName,
    isLoggedIn: Boolean(storedUserName),
    loginMessage: null,
    login: (name) => {
      localStorage.setItem('userName', name);
      set({ userName: name, isLoggedIn: true });
    },
    logout: () => {
      localStorage.removeItem('userName');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ userName: null, isLoggedIn: false });
    },
    showLoginMessage: (name) => {
      set({ loginMessage: `ようこそ ${name} さん` });
      setTimeout(() => set({ loginMessage: null }), 3000);
    }
  };
});

export default useAuthStore;

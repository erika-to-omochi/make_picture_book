'use client';

import { create } from 'zustand';

const useAuthStore = create((set) => ({
  userName: null,
  isLoggedIn: false,
  loginMessage: null,
  accessToken: null,
  refreshToken: null,

  login: (name, accessToken, refreshToken) => {
    localStorage.setItem('userName', name);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    set({ userName: name, isLoggedIn: true, accessToken, refreshToken });
  },

  logout: () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ userName: null, isLoggedIn: false, accessToken: null, refreshToken: null });
  },

  showLoginMessage: (name) => {
    set({ loginMessage: `ようこそ ${name} さん` });
    setTimeout(() => set({ loginMessage: null }), 3000);
  },

  setUserName: (name) => set({ userName: name, isLoggedIn: Boolean(name) }),
  setAccessToken: (token) => set({ accessToken: token }),
  setRefreshToken: (token) => set({ refreshToken: token }),
}));

export default useAuthStore;

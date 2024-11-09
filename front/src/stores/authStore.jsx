import { create } from 'zustand';

const useAuthStore = create((set) => {
  const storedUserName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;

  return {
    userName: storedUserName,
    isLoggedIn: Boolean(storedUserName),
    login: (name) => {
      localStorage.setItem('userName', name);
      set({ userName: name, isLoggedIn: true });
    },
    logout: () => {
      localStorage.removeItem('userName');
      set({ userName: null, isLoggedIn: false });
    }
  };
});

export default useAuthStore;

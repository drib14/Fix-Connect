import { create } from 'zustand';

const useStore = create((set) => ({
  user: null, // MongoDB user profile
  role: 'customer', // Current viewing dashboard role: 'customer' or 'worker'
  isAuthenticated: false,

  setUser: (user) => set({ 
    user, 
    role: user?.role || 'customer', 
    isAuthenticated: !!user 
  }),

  setRole: (role) => set({ role }),

  updateUserFields: (fields) => set((state) => ({
    user: state.user ? { ...state.user, ...fields } : null
  })),

  logout: () => set({ 
    user: null, 
    role: 'customer', 
    isAuthenticated: false 
  })
}));

export default useStore;

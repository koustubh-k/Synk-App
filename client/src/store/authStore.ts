import { create } from "zustand";

// Define the shape of the user and the store's state
interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  token: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  initializeAuth: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  // Action to handle user login
  login: (userData) => {
    set({ user: userData, isAuthenticated: true });
    localStorage.setItem("user", JSON.stringify(userData));
  },

  // Action to handle user logout
  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem("user");
  },

  // Action to initialize auth state from local storage
  initializeAuth: () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData: User = JSON.parse(storedUser);
        set({ user: userData, isAuthenticated: true });
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        get().logout(); // Clear invalid data
      }
    }
  },
}));

export default useAuthStore;

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  role: 'admin' | 'employee' | null;
  setToken: (token: string) => void;
  logout: () => void;
  checkTokenValidity: () => void;
}

interface DecodedToken {
  id: number;
  role: 'admin' | 'employee';
  iat: number;
  exp: number;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      role: null,
      setToken: (token: string) => {
        const decoded = jwtDecode<DecodedToken>(token); 
      
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          set({ token: null, isAuthenticated: false, role: null });
          return;
        }
        
        set({ token, isAuthenticated: true, role: decoded.role });
      },
      checkTokenValidity: () => {
        const state = useAuthStore.getState();
        if (state.token) {
          try {
            const decoded = jwtDecode<DecodedToken>(state.token);
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp < currentTime) {
              set({ token: null, isAuthenticated: false, role: null });
            }
          } catch {
            set({ token: null, isAuthenticated: false, role: null });
          }
        }
      },
      logout: () => set({ token: null, isAuthenticated: false, role: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
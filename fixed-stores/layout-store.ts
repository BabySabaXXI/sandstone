import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

// Store version for migrations
const STORE_VERSION = 1;

interface AIPopupPosition {
  x: number;
  y: number;
}

interface LayoutStore {
  // State
  sidebarOpen: boolean;
  aiPopupOpen: boolean;
  aiPopupPosition: AIPopupPosition;
  isHydrated: boolean;
  
  // Actions
  toggleSidebar: () => void;
  toggleAIPopup: () => void;
  setAIPopupPosition: (position: AIPopupPosition) => void;
  openAIPopup: () => void;
  closeAIPopup: () => void;
  resetAIPopupPosition: () => void;
  setHydrated: (value: boolean) => void;
}

// Safe window access for SSR compatibility
const getDefaultAIPosition = (): AIPopupPosition => {
  if (typeof window !== "undefined") {
    return { x: window.innerWidth - 420, y: 100 };
  }
  return { x: 100, y: 100 };
};

// Custom storage with error handling
const customStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.error(`Error reading ${name} from localStorage:`, error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error(`Error writing ${name} to localStorage:`, error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        toast.error('Storage limit exceeded. Please clear some data.');
      }
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error(`Error removing ${name} from localStorage:`, error);
    }
  },
};

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      aiPopupOpen: false,
      aiPopupPosition: getDefaultAIPosition(),
      isHydrated: false,

      setHydrated: (value) => set({ isHydrated: value }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      toggleAIPopup: () => set((state) => ({ aiPopupOpen: !state.aiPopupOpen })),
      
      setAIPopupPosition: (position) => set({ aiPopupPosition: position }),
      
      openAIPopup: () => set({ aiPopupOpen: true }),
      
      closeAIPopup: () => set({ aiPopupOpen: false }),
      
      resetAIPopupPosition: () => set({ aiPopupPosition: getDefaultAIPosition() }),
    }),
    {
      name: "layout-store",
      version: STORE_VERSION,
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ 
        sidebarOpen: state.sidebarOpen,
        aiPopupOpen: state.aiPopupOpen,
        aiPopupPosition: state.aiPopupPosition,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

// Selector hooks for better performance
export const useSidebarOpen = () => 
  useLayoutStore((state) => state.sidebarOpen);

export const useAIPopupOpen = () => 
  useLayoutStore((state) => state.aiPopupOpen);

export const useAIPopupPosition = () => 
  useLayoutStore((state) => state.aiPopupPosition);

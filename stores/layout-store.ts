import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LayoutStore {
  sidebarOpen: boolean;
  aiPopupOpen: boolean;
  aiPopupPosition: { x: number; y: number };
  toggleSidebar: () => void;
  toggleAIPopup: () => void;
  setAIPopupPosition: (position: { x: number; y: number }) => void;
  openAIPopup: () => void;
  closeAIPopup: () => void;
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      aiPopupOpen: false,
      aiPopupPosition: { x: typeof window !== 'undefined' ? window.innerWidth - 420 : 100, y: 100 },
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleAIPopup: () => set((state) => ({ aiPopupOpen: !state.aiPopupOpen })),
      setAIPopupPosition: (position) => set({ aiPopupPosition: position }),
      openAIPopup: () => set({ aiPopupOpen: true }),
      closeAIPopup: () => set({ aiPopupOpen: false }),
    }),
    {
      name: "layout-store",
    }
  )
);

import { create } from 'zustand'

const initialSidebarOpen = typeof window !== 'undefined' ? window.innerWidth > 900 : true

export const useUIStore = create((set) => ({
  sidebarOpen: initialSidebarOpen,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set(() => ({ sidebarOpen: open })),
}))

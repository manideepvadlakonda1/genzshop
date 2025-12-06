import { create } from 'zustand'

export const useUIStore = create((set) => ({
  sidebarOpen: window.innerWidth > 900,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))

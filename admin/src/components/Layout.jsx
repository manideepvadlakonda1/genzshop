import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useUIStore } from '../store/uiStore'
import Sidebar from './Sidebar'
import Header from './Header'
import './layout.css'

const Layout = () => {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore()

  useEffect(() => {
    // Close sidebar on initial load for mobile widths
    if (typeof window !== 'undefined' && window.innerWidth <= 900 && sidebarOpen) {
      setSidebarOpen(false)
    }

    const handleResize = () => {
      if (window.innerWidth > 900 && !sidebarOpen) {
        setSidebarOpen(true)
      }

      if (window.innerWidth <= 900 && sidebarOpen) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarOpen, setSidebarOpen])

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

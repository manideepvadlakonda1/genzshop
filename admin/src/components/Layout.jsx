import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useUIStore } from '../store/uiStore'
import Sidebar from './Sidebar'
import Header from './Header'
import './layout.css'

const Layout = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900 && !sidebarOpen) {
        toggleSidebar()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarOpen, toggleSidebar])

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

import { NavLink, useNavigate } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'
import { useAuthStore } from '../store/authStore'
import './sidebar.css'

const items = [
  { to: '/', icon: 'fa-gauge', label: 'Analytics' },
  { to: '/products', icon: 'fa-boxes-stacked', label: 'Product Management' },
  { to: '/categories', icon: 'fa-layer-group', label: 'Category & Sub' },
  { to: '/orders', icon: 'fa-receipt', label: 'Order Management' },
  { to: '/customers', icon: 'fa-user-group', label: 'Customer Management' },
  { to: '/offers', icon: 'fa-bullhorn', label: 'Offer Banners' },
  { to: '/faq', icon: 'fa-circle-question', label: 'FAQ Management' },
  { to: '/payments', icon: 'fa-credit-card', label: 'Payments' },
  { to: '/shipping', icon: 'fa-truck-fast', label: 'Shipping' },
]

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login')
    }
  }

  const handleNavClick = () => {
    if (window.innerWidth <= 900) {
      toggleSidebar()
    }
  }

  return (
    <>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={toggleSidebar} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="menu-btn" onClick={toggleSidebar}>
            <i className="fa-solid fa-bars" />
          </button>
          <span className="brand">Admin Panel</span>
        </div>
        <nav className="nav">
          {items.map((it) => (
            <NavLink 
              key={it.to} 
              to={it.to} 
              end 
              className={({isActive})=>`nav-item ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <i className={`fa-solid ${it.icon}`} />
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item logout">
            <i className="fa-solid fa-right-from-bracket" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

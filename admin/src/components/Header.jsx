import { useLocation } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'
import './header.css'

const titleMap = {
  '/': 'Analytics',
  '/products': 'Product Management',
  '/categories': 'Category & Collections',
  '/orders': 'Order Management',
  '/customers': 'Customer Management',
  '/offers': 'Offer Banners',
  '/faq': 'FAQ Management',
  '/payments': 'Payments',
  '/shipping': 'Shipping',
}

const Header = () => {
  const { pathname } = useLocation()
  const { toggleSidebar } = useUIStore()
  const title = titleMap[pathname] || 'Admin'
  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <i className="fa-solid fa-bars" />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="header-actions">
        <button className="icon-btn" title="Notifications">
          <i className="fa-regular fa-bell" />
        </button>
        <div className="admin-info">
          <div className="avatar">A</div>
          <div className="meta">
            <div className="name">Admin</div>
            <div className="email">admin@genzshop.com</div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

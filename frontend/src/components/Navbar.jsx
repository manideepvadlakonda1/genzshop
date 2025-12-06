import { Link } from 'react-router-dom'
import { useCartStore } from '../context/cartStore'
import { useAuthStore } from '../context/authStore'
import { useWishlistStore } from '../context/wishlistStore'
import './Navbar.css'

const Navbar = () => {
  const { cart } = useCartStore()
  const { user, logout } = useAuthStore()
  const { wishlistItems } = useWishlistStore()
  
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)
  const wishlistCount = wishlistItems.length
  
  // Debug: Check if user is actually logged in
  console.log('Navbar - Current user:', user)

  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container navbar-content">
          <div className="navbar-left">
            <Link to="/" className="logo">
              <img src="/logo.png" alt="GenZShop" className="logo-img" />
              <span className="logo-text">GenZShop</span>
            </Link>
          </div>
          
          <ul className="nav-menu">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop" className="dropdown-toggle">Shop Now</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          
          <div className="nav-actions">
            {user ? (
              <Link to="/profile" className="profile-link" title="Profile">
                <i className="fas fa-user"></i>
                <span className="user-name">{user.name}</span>
              </Link>
            ) : (
              <Link to="/login" className="icon-link" title="Login">
                <i className="fas fa-user"></i>
              </Link>
            )}
            
            <Link to="/wishlist" className="icon-link wishlist-icon" title="Wishlist">
              <i className="fas fa-heart"></i>
              {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
            </Link>
            
            <Link to="/cart" className="icon-link cart-icon" title="Cart">
              <i className="fas fa-shopping-cart"></i>
              {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar

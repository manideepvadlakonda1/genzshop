import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      {/* Footer Main */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-columns">
            {/* Brand Section */}
            <div className="footer-column footer-brand-section">
              <div className="brand-logo">
                <img src="/logo.png" alt="GenZshop" className="footer-logo-img" />
                <h3 className="footer-logo">GenZshop</h3>
              </div>
              <p className="brand-description">
                We have the best collection of trendy fashion and accessories. Your one-stop destination for quality products at amazing prices.
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer-column">
              <h5 className="footer-title">Quick Links</h5>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/shop">Shop Now</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="footer-column">
              <h5 className="footer-title">Customer Service</h5>
              <ul className="footer-links">
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/terms-conditions">Terms & Conditions</Link></li>
                <li><Link to="/shipping-policy">Shipping & Return Policy</Link></li>
                <li><Link to="/cancellation-refunds">Cancellation & Refunds</Link></li>
                <li><Link to="/faqs">FAQs</Link></li>
              </ul>
            </div>

            {/* Stay Connected */}
            <div className="footer-column">
              <h5 className="footer-title">Stay Connected</h5>
              <p className="subscribe-description">Subscribe to our newsletter for exclusive offers and updates!</p>
              <form className="footer-subscribe">
                <div className="subscribe-input-group">
                  <input type="email" placeholder="Your Email" className="subscribe-input" />
                  <button type="submit" className="subscribe-btn">Subscribe</button>
                </div>
              </form>
              <div className="footer-social">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <p className="footer-copyright">© 2024 GenZshop. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

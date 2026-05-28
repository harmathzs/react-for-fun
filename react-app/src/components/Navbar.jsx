import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-home" aria-label="Go to home">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3.2 2.8 10.6a1 1 0 0 0 1.3 1.54l1.4-1.12V20a1 1 0 0 0 1 1h4.9a1 1 0 0 0 1-1v-4.6h1.2V20a1 1 0 0 0 1 1h4.9a1 1 0 0 0 1-1v-8.98l1.39 1.12a1 1 0 1 0 1.26-1.54L12 3.2Z" />
          </svg>
        </NavLink>

        <NavLink to="/" className="navbar-brand">React 4 fun</NavLink>

        <ul className="navbar-links">
          <li><NavLink to="/" end>Interest in Products</NavLink></li>
          <li><NavLink to="/shop">Shop</NavLink></li>
        </ul>

        <div className="navbar-profile" aria-label="User area">
          <span className="username-pill" title="User name placeholder">Guest User</span>
          <button type="button" className="login-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 12a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Zm0 1.8c-4.58 0-8.3 2.53-8.3 5.65a1 1 0 0 0 1 1h14.6a1 1 0 0 0 1-1c0-3.12-3.72-5.65-8.3-5.65Z" />
            </svg>
            <span>Login</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

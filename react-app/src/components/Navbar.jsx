import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar({ authenticated, user, onLogout }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const displayName = user?.firstName || user?.username || user?.email || 'Guest User'
  const homePath = authenticated ? '/shop' : '/'

  async function handleLogoutClick() {
    setIsProfileOpen(false)
    await onLogout()
    navigate('/', { replace: true })
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to={homePath} className="navbar-home" aria-label="Go to home">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3.2 2.8 10.6a1 1 0 0 0 1.3 1.54l1.4-1.12V20a1 1 0 0 0 1 1h4.9a1 1 0 0 0 1-1v-4.6h1.2V20a1 1 0 0 0 1 1h4.9a1 1 0 0 0 1-1v-8.98l1.39 1.12a1 1 0 1 0 1.26-1.54L12 3.2Z" />
          </svg>
        </NavLink>

        <NavLink to={homePath} className="navbar-brand">React 4 fun</NavLink>

        <ul className="navbar-links">
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/products">Products</NavLink></li>
        </ul>

        <div className="navbar-actions">
          <button
            type="button"
            className="search-trigger"
            aria-label="Open search"
            onClick={() => setSearchOpen((s) => !s)}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.5 21.5 20l-6-6z" />
            </svg>
          </button>
          {searchOpen && (
            <div className="search-box">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
              />
            </div>
          )}

          <div className="navbar-profile" aria-label="User area" ref={profileRef}>
          <span className="username-pill" title={displayName}>{displayName}</span>
          <button
            type="button"
            className="profile-trigger"
            aria-haspopup="menu"
            aria-expanded={isProfileOpen}
            onClick={() => setIsProfileOpen((prev) => !prev)}
          >
            <span className="avatar-circle" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 12a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Zm0 1.8c-4.58 0-8.3 2.53-8.3 5.65a1 1 0 0 0 1 1h14.6a1 1 0 0 0 1-1c0-3.12-3.72-5.65-8.3-5.65Z" />
              </svg>
            </span>
            <svg className="trigger-chevron" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.2 9.2a1 1 0 0 1 1.4 0L12 13.6l4.4-4.4a1 1 0 1 1 1.4 1.4l-5.1 5.1a1 1 0 0 1-1.4 0l-5.1-5.1a1 1 0 0 1 0-1.4Z" />
            </svg>
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown" role="menu" aria-label="Profile menu">
              {authenticated ? (
                <button type="button" className="profile-menu-item" role="menuitem" onClick={handleLogoutClick}>Logout</button>
              ) : (
                <>
                  <NavLink to="/login" className="profile-menu-item" role="menuitem" onClick={() => setIsProfileOpen(false)}>Login</NavLink>
                  <NavLink to="/register" className="profile-menu-item" role="menuitem" onClick={() => setIsProfileOpen(false)}>Register</NavLink>
                </>
              )}
            </div>
          )}
        </div>

          <button
            type="button"
            className="cart-trigger"
            aria-label="View cart"
            onClick={() => navigate('/cart')}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.45A1 1 0 0 0 9 17h8v-2H9.42a.25.25 0 0 1-.23-.15L9.1 14h7.45a1 1 0 0 0 .92-.63l1.93-5.9A1 1 0 0 0 18.5 6H6.21L5.27 4H7z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}

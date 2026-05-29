import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)

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

        <div className="navbar-profile" aria-label="User area" ref={profileRef}>
          <span className="username-pill" title="User name placeholder">Guest User</span>
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
              <button type="button" className="profile-menu-item" role="menuitem">Login</button>
              <button type="button" className="profile-menu-item" role="menuitem">Register</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

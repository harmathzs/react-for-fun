import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">React 4 fun</NavLink>
        <ul className="navbar-links">
          <li><NavLink to="/" end>Interest in Products</NavLink></li>
          {/* Add more menu items here */}
        </ul>
      </div>
    </nav>
  )
}

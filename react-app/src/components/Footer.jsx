import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-col">
          <strong>Our Company</strong>
          <ul>
            <li><NavLink to="/about-us">About us</NavLink></li>
            <li><NavLink to="/careers">Our Stores</NavLink></li>
            <li><a href="#">Our Blog</a></li>
            <li><NavLink to="/careers">Careers</NavLink></li>
          </ul>
        </div>

        <div className="footer-col">
          <strong>Get Help</strong>
          <ul>
            <li><NavLink to="/order-status">Order Status</NavLink></li>
            <li><NavLink to="/shipping">Shipping & Delivery</NavLink></li>
            <li><NavLink to="/faq">FAQ</NavLink></li>
            <li><NavLink to="/contact-us">Contact Us</NavLink></li>
            <li><NavLink to="/accessibility">Accessibility</NavLink></li>
          </ul>
        </div>

        <div className="footer-col">
          <strong>Account</strong>
          <ul>
            <li><NavLink to="/account">My Account</NavLink></li>
            <li><NavLink to="/orders">Order History</NavLink></li>
            <li><a href="#">My Quotes</a></li>
            <li><a href="#">My List</a></li>
            <li><a href="#">Addresses</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <strong>Follow</strong>
          <div className="social-logos">
            <a href="#" aria-label="Twitter">X</a>
            <a href="#" aria-label="Facebook">Facebook</a>
            <a href="#" aria-label="YouTube">YouTube</a>
            <a href="#" aria-label="Instagram">Instagram</a>
          </div>
          <div className="map-placeholder">
            <div className="map-marker">📍 Kiskunfélegyháza, Hungary</div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} React 4 fun</p>
      </div>
    </footer>
  )
}

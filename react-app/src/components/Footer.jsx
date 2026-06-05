import React from 'react'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-col">
          <strong>Our Company</strong>
          <ul>
            <li><a href="#">About us</a></li>
            <li><a href="#">Our Stores</a></li>
            <li><a href="#">Our Blog</a></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <strong>Get Help</strong>
          <ul>
            <li><a href="#">Order Status</a></li>
            <li><a href="#">Shipping & Delivery</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Accessibility</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <strong>Account</strong>
          <ul>
            <li><a href="#">My Account</a></li>
            <li><a href="#">Order History</a></li>
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
        </div>
      </div>

      <div className="footer-map">
        <div className="map-placeholder">
          <div className="map-marker">📍 Kiskunfélegyháza, Hungary</div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} React 4 fun</p>
      </div>
    </footer>
  )
}

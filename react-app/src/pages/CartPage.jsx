import { Link } from 'react-router-dom'

export default function CartPage() {
  return (
    <section className="page-card">
      <h1>Your Cart</h1>
      <p>This cart is a static placeholder. In production it will list items added by the user.</p>

      <div className="cart-list">
        <div className="cart-item">
          <div className="cart-item-info">
            <strong>Sample Product A</strong>
            <div>Qty: 1</div>
          </div>
          <div className="cart-item-price">€19.99</div>
        </div>

        <div className="cart-summary">
          <div>Subtotal: €19.99</div>
          <div>Shipping: €4.99</div>
          <div><strong>Total: €24.98</strong></div>
          <Link to="/checkout" className="btn-primary">Proceed to Checkout</Link>
        </div>
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

export default function CartPage() {
  const cart = useCart()

  if (!cart) return null

  return (
    <section className="page-card">
      <h1>Your Cart</h1>
      {cart.items.length === 0 ? (
        <p>Your cart is empty. Browse products to add items.</p>
      ) : (
        <div className="cart-list">
          {cart.items.map(it => (
            <div key={it.product.id} className="cart-item">
              <div className="cart-item-info">
                <strong>{it.product.name}</strong>
                <div>Qty: 
                  <input type="number" min="0" value={it.qty} onChange={(e)=>cart.updateQty(it.product.id, Number(e.target.value)||0)} style={{width:60, marginLeft:8}} />
                </div>
              </div>
              <div className="cart-item-price">{(it.product.pricebookEntry?.unitPrice||0) * it.qty} Ft</div>
            </div>
          ))}

          <div className="cart-summary">
            <div>Subtotal: {cart.subtotal} Ft</div>
            <div>Shipping: 0 Ft</div>
            <div><strong>Total: {cart.subtotal} Ft</strong></div>
            <Link to="/checkout" className="btn-primary">Proceed to Checkout</Link>
          </div>
        </div>
      )}
    </section>
  )
}

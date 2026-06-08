import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

export default function CartPage() {
  const cart = useCart()

  if (!cart) return null

  async function handleCheckout() {
    try {
      const payload = {
        traceId: Math.random().toString(36).slice(2,10),
        externalOrderId: `ext_${Date.now()}`,
        orderProducts: cart.items.map(it => ({ productId: it.product.id, quantity: it.qty, unitPrice: it.product.pricebookEntry?.unitPrice }))
      }

      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.message || 'checkout failed')
      // clear cart on success
      cart.clearCart()
      alert('Checkout processed (see server logs). Response: ' + JSON.stringify(data.apex || data))
    } catch (e) {
      console.error(e)
      alert('Checkout failed: ' + (e.message || e))
    }
  }

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
            <button className="btn-primary" onClick={handleCheckout}>Proceed to Checkout</button>
          </div>
        </div>
      )}
    </section>
  )
}

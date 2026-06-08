import React, { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'

export default function ProductCard({ product, authenticated, onAdd }) {
  const [qty, setQty] = useState(1)
  const cart = useCart()
  const navigate = useNavigate()

  function handleAdd() {
    const q = Math.max(1, Number(qty) || 1)
    if (cart && cart.addItem) {
      cart.addItem(product, q)
      toast.success(
        (<div style={{display:'flex', alignItems:'center', gap:12}}>
          <div>{q} × {product.name} added to cart</div>
          <button onClick={() => navigate('/cart')} style={{background:'#0b5ed7', color:'#fff', border:'none', padding:'6px 10px', borderRadius:6}}>View Cart</button>
        </div>)
      )
      return
    }
    if (onAdd) onAdd(product, q)
  }

  return (
    <div className="product-card">
      <div className="product-media">
        <div className="media-placeholder">IMG</div>
      </div>
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-code">{product.code}</p>
        <p className="product-desc">{product.description}</p>
      </div>
      <div className="product-footer">
        <div className="price">{product.pricebookEntry ? `${product.pricebookEntry.unitPrice} Ft` : '—'}</div>
        {authenticated ? (
          <div className="cart-actions">
            <input className="card-qty" type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
            <button className="icon-cart" onClick={handleAdd} aria-label={`Add ${product.name} to cart`}>🛒</button>
          </div>
        ) : (
          <div className="login-note">Login to buy</div>
        )}
      </div>
    </div>
  )
}

import React, { useState } from 'react'

export default function ProductCard({ product, authenticated, onAdd }) {
  const [qty, setQty] = useState(1)

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
            <button className="icon-cart" onClick={() => onAdd && onAdd(product, qty)} aria-label={`Add ${product.name} to cart`}>🛒</button>
          </div>
        ) : (
          <div className="login-note">Login to buy</div>
        )}
      </div>
    </div>
  )
}

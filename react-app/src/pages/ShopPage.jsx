import React, { useState } from 'react'
import LoadingButton from '../components/LoadingButton'

export default function ShopPage() {
  const [rows, setRows] = useState([
    { query: '', qty: 1 },
    { query: '', qty: 1 },
    { query: '', qty: 1 },
    { query: '', qty: 1 },
    { query: '', qty: 1 },
  ])
  const [adding, setAdding] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)

  function updateRow(i, key, value) {
    const copy = rows.slice()
    copy[i] = { ...copy[i], [key]: value }
    setRows(copy)
  }

  function clearRow(i) {
    updateRow(i, 'query', '')
  }

  function addRow() {
    setAdding(true)
    setTimeout(() => {
      setRows([...rows, { query: '', qty: 1 }])
      setAdding(false)
    }, 180)
  }

  function addToCart() {
    setAddingToCart(true)
    // placeholder: integrate with cart API
    setTimeout(() => setAddingToCart(false), 500)
  }

  return (
    <main className="page-card shop-card">
      <section className="hero-banner">
        <div className="hero-inner">
          <h1>Welcome back — Quick Order</h1>
          <p>Fast add products by SKU or name and quantity.</p>
        </div>
      </section>

      <section className="quick-order-grid">
        <div className="quick-order">
          <h2>Quick Order</h2>
          <label className="row-labels">
            <span>Product</span>
            <span>Quantity</span>
          </label>
          <div className="product-rows">
            {rows.map((r, i) => (
              <div className="product-row" key={i}>
                <input
                  className="product-search"
                  placeholder={`Enter Product ${i + 1}...`}
                  value={r.query}
                  onChange={(e) => updateRow(i, 'query', e.target.value)}
                />
                <div className="qty-wrap">
                  <input
                    className="qty-input"
                    type="number"
                    min="1"
                    value={r.qty}
                    onChange={(e) => updateRow(i, 'qty', Math.max(1, Number(e.target.value) || 1))}
                  />
                </div>
                <button className="clear-btn" onClick={() => clearRow(i)}>✕</button>
              </div>
            ))}
          </div>

          <div className="quick-order-actions">
            <a className="link-add" role="button" onClick={addRow}>+ Add Product</a>
            <div className="addcart-wrap">
              <LoadingButton className="btn-primary" loading={addingToCart} onClick={addToCart}>Add to cart</LoadingButton>
            </div>
          </div>
        </div>

        <aside className="product-image">
          <div className="image-box">Promotional image or product</div>
        </aside>
      </section>
    </main>
  )
}

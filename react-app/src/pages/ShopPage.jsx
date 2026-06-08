import React, { useEffect, useState } from 'react'
import LoadingButton from '../components/LoadingButton'
import ComboBox from '../components/ComboBox'
import { useCart } from '../contexts/CartContext'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'

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
  const [products, setProducts] = useState([])
  const cart = useCart()
  const navigate = useNavigate()

  function updateRow(i, key, value) {
    const copy = rows.slice()
    copy[i] = { ...copy[i], [key]: value }
    setRows(copy)
  }

  function clearRow(i) {
    const copy = rows.slice()
    copy.splice(i, 1)
    setRows(copy.length ? copy : [{ query: '', qty: 1 }])
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
    // map row queries to product objects by name
    let added = 0
    for (const r of rows) {
      const name = (r.query || '').trim()
      if (!name) continue
      const lower = name.toLowerCase()
      const prod = products.find(p => (p.name || '').toLowerCase().includes(lower))
      if (!prod) continue
      cart.addItem(prod, Math.max(1, Number(r.qty) || 1))
      added += 1
      toast.success((
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div>{r.qty} × {prod.name} added to cart</div>
          <button onClick={() => navigate('/cart')} style={{background:'#0b5ed7', color:'#fff', border:'none', padding:'6px 10px', borderRadius:6}}>View Cart</button>
        </div>
      ))
    }
    setTimeout(() => {
      setAddingToCart(false)
      if (added === 0) toast.info('No matching products found to add')
    }, 250)
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/products')
        const j = await res.json()
        if (!mounted) return
        setProducts(j.products || [])
      } catch (e) {}
    })()
    return () => { mounted = false }
  }, [])

  return (
    <main className="page-card shop-card">
      <section className="hero-banner">
        <div className="hero-inner">
          <h1>Quick Order</h1>
          <p>&nbsp;</p>
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
                <ComboBox
                  items={products.map(p => p.name)}
                  placeholder={`Product ${i + 1}...`}
                  onSelect={(val) => updateRow(i, 'query', val)}
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
              <p>&nbsp;</p>
              <LoadingButton className="btn-primary" loading={addingToCart} onClick={addToCart}>Add to cart</LoadingButton>
            </div>
          </div>
        </div>

        <aside className="product-image">
          <div className="image-box">Promotional image</div>
        </aside>
      </section>
    </main>
  )
}

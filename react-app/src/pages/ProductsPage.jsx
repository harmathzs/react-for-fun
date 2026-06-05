import React, { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [familyFilter, setFamilyFilter] = useState('')
  const [sort, setSort] = useState('name')
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [pRes, sRes] = await Promise.all([
          fetch('/api/products').then(r => r.json()),
          fetch('/api/session', { credentials: 'include' }).then(r => r.json())
        ])
        if (pRes?.ok) setProducts(pRes.products || [])
        setAuthenticated(!!sRes?.authenticated)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const families = Array.from(new Set(products.map(p => p.family).filter(Boolean)))

  function filtered() {
    let list = products.slice()
    if (familyFilter) list = list.filter(p => p.family === familyFilter)
    if (sort === 'price-asc') list.sort((a,b)=> (a.pricebookEntry?.unitPrice||0)-(b.pricebookEntry?.unitPrice||0))
    else if (sort === 'price-desc') list.sort((a,b)=> (b.pricebookEntry?.unitPrice||0)-(a.pricebookEntry?.unitPrice||0))
    else list.sort((a,b)=> a.name.localeCompare(b.name))
    return list
  }

  function handleAdd(product, qty) {
    // TODO: call cart API
    alert(`Add ${qty} × ${product.name} to cart (placeholder)`)
  }

  return (
    <section className="page-card products-page">
      <h1>Products</h1>
      <p>Browse active products from Salesforce. Prices come from the active PricebookEntry.</p>

      <div className="products-grid">
        <div className="filters-row">
          <div className="family-badges">Product Family &nbsp; 
            <button className={`badge ${familyFilter === '' ? 'active' : ''}`} onClick={() => setFamilyFilter('')}>All</button>
            <button className={`badge ${familyFilter === '__none' ? 'active' : ''}`} onClick={() => setFamilyFilter('__none')}>None</button>
            {families.map(f => (
              <button key={f} className={`badge ${familyFilter === f ? 'active' : ''}`} onClick={() => setFamilyFilter(f)}>{f}</button>
            ))}
          </div>

          <div className="sort-controls">
            <label>Sort</label>
            <button className={`sort-btn ${sort === 'price-asc' ? 'active' : ''}`} onClick={() => setSort('price-asc')}>Price <span className="sort-icon">▲</span></button>
            <button className={`sort-btn ${sort === 'price-desc' ? 'active' : ''}`} onClick={() => setSort('price-desc')}>Price <span className="sort-icon">▼</span></button>
            <button className={`sort-btn ${sort === 'name' ? 'active' : ''}`} onClick={() => setSort('name')}>Name</button>
          </div>
        </div>

        <div className="products-list">
          {loading ? <p>Loading products...</p> : (
            <div className="cards-wrap">
              {filtered().map(p => (
                <ProductCard key={p.id} product={p} authenticated={authenticated} onAdd={handleAdd} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

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
        <aside className="products-filters">
          <h3>Filters</h3>
          <div className="filter-group">
            <label>Product Family</label>
            <select value={familyFilter} onChange={(e)=>setFamilyFilter(e.target.value)}>
              <option value="">All</option>
              {families.map(f=> <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Sort</label>
            <select value={sort} onChange={(e)=>setSort(e.target.value)}>
              <option value="name">Name</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
            </select>
          </div>
        </aside>

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

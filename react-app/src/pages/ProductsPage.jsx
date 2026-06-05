import { Link } from 'react-router-dom'

export default function ProductsPage() {
  return (
    <section className="page-card">
      <h1>Products</h1>
      <p>This is a static products overview. Product search and catalog will be added later.</p>

      <div className="products-grid">
        {[1,2,3,4,5,6].map((n) => (
          <article key={n} className="product-card">
            <div className="product-image">Image</div>
            <h3>Product {n}</h3>
            <p className="product-price">€{(9.99 * n).toFixed(2)}</p>
            <p className="product-desc">Short description for product {n}.</p>
            <Link to="/shop" className="btn-secondary">View</Link>
          </article>
        ))}
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'

export default function ShopPage() {
  return (
    <section className="page-card shop-card">
      <p className="shop-label">Preview</p>
      <h1>Webshop Is Coming Soon</h1>
      <p>
        This route is prepared for the upcoming webshop module. Product listing,
        checkout, and account features will be added here in a future sprint.
      </p>
      <div className="shop-actions">
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    </section>
  )
}

export default function OrderStatusPage() {
  return (
    <div className="page-card">
      <h1>Order Status</h1>
      
      <section>
        <h2>Track Your Order</h2>
        <p>
          Want to know where your order is? It's easier than you think. Here's how to check the status of your purchase.
        </p>
      </section>

      <section style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #93c5fd',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        margin: '1.5rem 0'
      }}>
        <h3 style={{ marginTop: 0, color: '#1e40af' }}>📍 How to Check Your Order Status</h3>
        <ol style={{ marginLeft: '1.5rem' }}>
          <li><strong>Log in to your account</strong> on our website</li>
          <li>Go to <strong>"Order History"</strong> in your account menu</li>
          <li>Find your order and click to expand it</li>
          <li>View the current status and details</li>
        </ol>
      </section>

      <section>
        <h2>Order Statuses Explained</h2>
        <div style={{ marginTop: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#3b82f6' }}>Draft</strong>
            <p style={{ margin: '0.5rem 0 0 0' }}>Your order is being prepared and hasn't been shipped yet.</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#10b981' }}>Activated</strong>
            <p style={{ margin: '0.5rem 0 0 0' }}>Your order is confirmed and on its way to you.</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#ef4444' }}>Cancelled</strong>
            <p style={{ margin: '0.5rem 0 0 0' }}>Your order has been cancelled. Contact us for details.</p>
          </div>
        </div>
      </section>

      <section>
        <h2>Don't Have an Account?</h2>
        <p>
          If you haven't created an account yet, <a href="/register" style={{ color: '#2563eb', textDecoration: 'none' }}>register here</a> to 
          access your order history and track shipments.
        </p>
      </section>

      <section>
        <h2>Still Can't Find Your Order?</h2>
        <p>
          <a href="/contact-us" style={{ color: '#2563eb', textDecoration: 'none' }}>Contact our support team</a> and we'll help you locate it.
        </p>
      </section>
    </div>
  )
}

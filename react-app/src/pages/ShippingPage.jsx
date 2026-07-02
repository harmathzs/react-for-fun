export default function ShippingPage() {
  return (
    <div className="page-card">
      <h1>Shipping & Delivery</h1>
      
      <section>
        <h2>Get Your Order to You—Fast and Safe</h2>
        <p>
          We work hard to get your order to you quickly without breaking anything in transit. Here's what you need to know about shipping.
        </p>
      </section>

      <section>
        <h2>Shipping Methods</h2>
        <div style={{ marginTop: '1rem' }}>
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ marginTop: 0 }}>Standard Shipping</h3>
            <p><strong>Delivery Time:</strong> 5-7 business days</p>
            <p><strong>Cost:</strong> Free on orders over €50</p>
            <p style={{ color: '#666' }}>Perfect if you're not in a rush. We'll pack your order carefully to ensure it arrives in great condition.</p>
          </div>

          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ marginTop: 0 }}>Express Shipping</h3>
            <p><strong>Delivery Time:</strong> 2-3 business days</p>
            <p><strong>Cost:</strong> €12.99</p>
            <p style={{ color: '#666' }}>Need it faster? We'll prioritize your order and get it out ASAP.</p>
          </div>

          <div>
            <h3 style={{ marginTop: 0 }}>Local Pickup</h3>
            <p><strong>Pickup:</strong> 1 business day</p>
            <p><strong>Cost:</strong> Free</p>
            <p style={{ color: '#666' }}>Available in Kiskunfélegyháza. Your order will be ready to pick up the next business day.</p>
          </div>
        </div>
      </section>

      <section>
        <h2>Order Processing</h2>
        <p>
          Orders typically ship within 24 hours during business days. Processing times may be longer during peak seasons or holidays.
        </p>
      </section>

      <section>
        <h2>International Shipping</h2>
        <p>
          We currently ship to all EU countries. Delivery times and costs vary by destination. International orders may be subject to customs fees.
        </p>
      </section>

      <section>
        <h2>Tracking Your Shipment</h2>
        <p>
          Once your order ships, we'll send you a tracking link via email. You can also check your order status anytime 
          in your <a href="/orders" style={{ color: '#2563eb', textDecoration: 'none' }}>Order History</a>.
        </p>
      </section>

      <section>
        <h2>Having Issues?</h2>
        <p>
          Lost package? Delayed delivery? <a href="/contact-us" style={{ color: '#2563eb', textDecoration: 'none' }}>Let us know</a> and we'll make it right.
        </p>
      </section>
    </div>
  )
}

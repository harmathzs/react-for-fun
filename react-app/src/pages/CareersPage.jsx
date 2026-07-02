export default function CareersPage() {
  return (
    <div className="page-card">
      <h1>Careers</h1>
      
      <section>
        <h2>Join Our Team</h2>
        <p>
          We're a small, focused team in Kiskunfélegyháza, and we love what we do. While we're not actively hiring right now, 
          we're always on the lookout for talented, passionate people who share our values.
        </p>
      </section>

      <section style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        margin: '1.5rem 0'
      }}>
        <h3 style={{ marginTop: 0, color: '#16a34a' }}>📋 Currently Available Positions</h3>
        <p style={{ margin: 0 }}>
          <strong>None at the moment.</strong> But check back later—we're always growing!
        </p>
      </section>

      <section>
        <h2>What We're Looking For</h2>
        <p>When we do open positions, we seek people who:</p>
        <ul style={{ marginLeft: '1.5rem' }}>
          <li>Are genuinely curious about technology</li>
          <li>Can explain complex ideas simply</li>
          <li>Collaborate well with others</li>
          <li>Take pride in quality work</li>
          <li>Bring humor and humanity to the team</li>
        </ul>
      </section>

      <section>
        <h2>Interested?</h2>
        <p>
          Keep an eye on this page or <a href="/contact-us" style={{ color: '#2563eb', textDecoration: 'none' }}>reach out</a> to introduce yourself. 
          We'd love to hear from you!
        </p>
      </section>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="page-card">
      <h1>About Us</h1>
      
      <section>
        <h2>Who We Are</h2>
        <p>
          Welcome to React 4 Fun! We're a team of passionate developers and creators based in Kiskunfélegyháza, Hungary, 
          dedicated to building modern, user-friendly web experiences. What started as a fun project has evolved into 
          something we're genuinely proud of.
        </p>
      </section>

      <section>
        <h2>Our Mission</h2>
        <p>
          We believe that great software should be intuitive, fast, and actually enjoyable to use. Our mission is to 
          combine cutting-edge technology with thoughtful design to create digital products that make your life easier—
          not more complicated.
        </p>
      </section>

      <section>
        <h2>Our Values</h2>
        <ul style={{ marginLeft: '1.5rem' }}>
          <li><strong>Quality First:</strong> We don't ship things we wouldn't use ourselves</li>
          <li><strong>User-Centric:</strong> Your feedback drives our decisions</li>
          <li><strong>Transparency:</strong> We're honest about what we can and can't do</li>
          <li><strong>Continuous Learning:</strong> Technology moves fast, and so do we</li>
        </ul>
      </section>

      <section>
        <h2>Why React?</h2>
        <p>
          React isn't just our tech stack—it's part of our philosophy. React components, like our team, are modular, 
          reusable, and work best when they communicate clearly. We think that applies to business too.
        </p>
      </section>

      <p style={{ marginTop: '2rem', fontStyle: 'italic', color: '#666' }}>
        Questions? <a href="/contact-us" style={{ color: '#2563eb', textDecoration: 'none' }}>Get in touch</a> anytime.
      </p>
    </div>
  )
}

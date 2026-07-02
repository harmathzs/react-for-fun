export default function AccessibilityPage() {
  return (
    <div className="page-card">
      <h1>Accessibility</h1>
      
      <section>
        <h2>Our Commitment to Accessibility</h2>
        <p>
          At React 4 Fun, we believe the web should be accessible to everyone. We're committed to making our site usable 
          for people of all abilities, including those with disabilities.
        </p>
      </section>

      <section>
        <h2>Accessibility Features</h2>
        <ul style={{ marginLeft: '1.5rem' }}>
          <li><strong>Keyboard Navigation:</strong> All functionality is accessible via keyboard alone. Use Tab to navigate and Enter/Space to interact.</li>
          <li><strong>Screen Reader Support:</strong> Our site is compatible with screen readers like NVDA, JAWS, and VoiceOver.</li>
          <li><strong>Color Contrast:</strong> Text and interactive elements meet WCAG AA standards for color contrast.</li>
          <li><strong>Text Sizing:</strong> You can adjust text size in your browser without breaking the layout.</li>
          <li><strong>Focus Indicators:</strong> Clear focus indicators help you see where you are on the page.</li>
          <li><strong>Image Alt Text:</strong> All images have descriptive alt text.</li>
          <li><strong>Semantic HTML:</strong> Our site uses proper HTML structure for better interpretation by assistive technologies.</li>
        </ul>
      </section>

      <section>
        <h2>Standards Compliance</h2>
        <p>
          We aim to comply with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. This means our content 
          should be perceivable, operable, understandable, and robust.
        </p>
      </section>

      <section>
        <h2>Browser and Assistive Technology Support</h2>
        <p>
          We test our site with popular browsers and assistive technologies to ensure compatibility:
        </p>
        <ul style={{ marginLeft: '1.5rem' }}>
          <li>Screen readers: NVDA, JAWS, VoiceOver</li>
          <li>Browsers: Chrome, Firefox, Safari, Edge</li>
          <li>Zoom levels: Up to 200%</li>
        </ul>
      </section>

      <section>
        <h2>Accessibility Controls</h2>
        <p>
          <strong>Browser Zoom:</strong> Most browsers allow you to zoom in or out using Ctrl/Cmd + Plus/Minus keys.<br />
          <strong>Color Filters:</strong> Your operating system may have built-in color adjustment tools.
        </p>
      </section>

      <section>
        <h2>Known Limitations</h2>
        <p>
          While we work hard to be accessible, some third-party content or features may have limitations. 
          If you encounter any issues, please let us know.
        </p>
      </section>

      <section style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #fcd34d',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        margin: '1.5rem 0'
      }}>
        <h3 style={{ marginTop: 0 }}>Report an Accessibility Issue</h3>
        <p>
          Found something that's not accessible? We want to know. <a href="/contact-us" style={{ color: '#2563eb', textDecoration: 'none' }}>Contact us</a> with 
          details about the issue, including your browser and assistive technology if applicable. We'll prioritize fixing it.
        </p>
      </section>

      <section>
        <h2>Useful Resources</h2>
        <ul style={{ marginLeft: '1.5rem' }}>
          <li><a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>WCAG 2.1 Quick Reference</a></li>
          <li><a href="https://www.webaim.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>WebAIM - Web Accessibility In Mind</a></li>
          <li><a href="https://www.a11y-101.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>A11y 101</a></li>
        </ul>
      </section>

      <p style={{ marginTop: '2rem', fontStyle: 'italic', color: '#666' }}>
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  )
}

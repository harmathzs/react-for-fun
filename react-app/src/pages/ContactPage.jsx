import { useState } from 'react'
import { toast } from 'react-toastify'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        toast.error('Please fill in all fields')
        setLoading(false)
        return
      }

      toast.success('Message sent! We\'ll get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-card">
      <h1>Contact Us</h1>
      
      <section>
        <h2>We'd Love to Hear From You</h2>
        <p>
          Questions, feedback, or just want to say hi? Get in touch using the form below or reach us directly.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', margin: '2rem 0' }}>
        <div>
          <h3 style={{ marginTop: 0 }}>Direct Contact</h3>
          <p>
            <strong>Email:</strong><br />
            <a href="mailto:hello@react4fun.com" style={{ color: '#2563eb', textDecoration: 'none' }}>hello@react4fun.com</a>
          </p>
          <p>
            <strong>Phone:</strong><br />
            <a href="tel:+36-70-123-4567" style={{ color: '#2563eb', textDecoration: 'none' }}>+36 70 123 4567</a>
          </p>
          <p>
            <strong>Address:</strong><br />
            Kiskunfélegyháza, Hungary
          </p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            We respond to emails within 24 hours during business days.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            style={{
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.95rem'
            }}
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            style={{
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.95rem'
            }}
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            disabled={loading}
            style={{
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.95rem'
            }}
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            disabled={loading}
            rows="4"
            style={{
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: loading ? '#d1d5db' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      <section style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
        <h3>Response Time</h3>
        <p>
          We aim to respond to all inquiries within 24 hours on business days. For urgent matters, call us directly.
        </p>
      </section>
    </div>
  )
}

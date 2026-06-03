import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage({ onAuthChange }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    // Submit login credentials and establish site session cookie.
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const payload = await response.json()

      if (!response.ok || !payload.ok) {
        setError(payload.error || 'Login failed.')
        return
      }

      await onAuthChange()
      setMessage('Login successful. You can continue to the webshop.')
      navigate('/shop', { replace: true })
    } catch {
      setError('Network error while logging in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-card auth-card auth-card-sm">
      <h1>Login</h1>
      <p>Use the account you verified during registration.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button className="btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {message && <p className="auth-success">{message}</p>}
      {error && <p className="auth-error">{error}</p>}

      <p className="auth-switch">New user? <Link to="/register">Register here</Link>.</p>
    </section>
  )
}

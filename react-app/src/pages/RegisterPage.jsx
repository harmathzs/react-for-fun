import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const initialForm = {
  firstName: '',
  lastName: '',
  company: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: ''
}

export default function RegisterPage({ onAuthChange }) {
  const [form, setForm] = useState(initialForm)
  const [verifyCode, setVerifyCode] = useState('')
  const [serverCode, setServerCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [registrationReady, setRegistrationReady] = useState(false)
  const navigate = useNavigate()

  function updateField(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (form.password !== form.confirmPassword) {
      setError('Password and confirmation must match.')
      return
    }

    setIsSubmitting(true)

    // Send registration request to serverless endpoint.
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          company: form.company,
          email: form.email,
          username: form.username || form.email,
          password: form.password
        })
      })

      const payload = await response.json()

      if (!response.ok || !payload.ok) {
        setError(payload.error || 'Registration failed.')
        return
      }

      // Keep code visible in dev mode until email sender is integrated.
      setServerCode(payload.verificationCode || '')
      setMessage(payload.message || 'Registration submitted. Please verify your email code.')
      setRegistrationReady(true)
    } catch {
      setError('Network error while registering. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVerifySubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!verifyCode.trim()) {
      setError('Enter the verification code first.')
      return
    }

    setIsVerifying(true)

    // Verify registration code and activate user.
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: verifyCode.trim() })
      })

      const payload = await response.json()

      if (!response.ok || !payload.ok) {
        setError(payload.error || 'Verification failed.')
        return
      }

      await onAuthChange()
      setMessage('Email verified. Redirecting to the webshop.')
      navigate('/shop', { replace: true })
    } catch {
      setError('Network error while verifying. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <section className="page-card auth-card">
      <h1>Create Your Webshop Account</h1>
      <p>Register with your business details. We will activate login after verification.</p>

      <form className="auth-form" onSubmit={handleRegisterSubmit}>
        <div className="form-grid auth-grid">
          <div className="field">
            <label htmlFor="reg-first-name">First Name</label>
            <input
              id="reg-first-name"
              name="firstName"
              value={form.firstName}
              onChange={updateField}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="reg-last-name">Last Name</label>
            <input
              id="reg-last-name"
              name="lastName"
              value={form.lastName}
              onChange={updateField}
              required
            />
          </div>

          <div className="field field-full">
            <label htmlFor="reg-company">Company</label>
            <input
              id="reg-company"
              name="company"
              value={form.company}
              onChange={updateField}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              name="username"
              value={form.username}
              onChange={updateField}
              placeholder="Defaults to email"
            />
          </div>

          <div className="field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              value={form.password}
              onChange={updateField}
              minLength={8}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="reg-confirm-password">Confirm Password</label>
            <input
              id="reg-confirm-password"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={updateField}
              minLength={8}
              required
            />
          </div>
        </div>

        <button className="btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Register'}
        </button>
      </form>

      {registrationReady && (
        <form className="auth-form verify-form" onSubmit={handleVerifySubmit}>
          <h2>Verify Email</h2>
          <p>Enter the code you received by email.</p>

          {serverCode && (
            <p className="verify-preview">Dev verification code: <strong>{serverCode}</strong></p>
          )}

          <div className="field">
            <label htmlFor="verify-code">Verification Code</label>
            <input
              id="verify-code"
              name="verifyCode"
              value={verifyCode}
              onChange={(event) => setVerifyCode(event.target.value)}
              placeholder="6-digit code"
            />
          </div>

          <button className="btn-primary" type="submit" disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      )}

      {message && <p className="auth-success">{message}</p>}
      {error && <p className="auth-error">{error}</p>}

      <p className="auth-switch">Already registered? <Link to="/login">Login here</Link>.</p>
    </section>
  )
}

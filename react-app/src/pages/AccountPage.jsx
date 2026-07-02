import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function AccountPage({ user, onAuthChange }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  if (!user) {
    return (
      <section className="page-card auth-card-sm">
        <p>Please log in to view your account.</p>
      </section>
    )
  }

  async function handleDeleteAccount() {
    setIsDeleting(true)
    try {
      const res = await fetch('/api/deleteAccount', {
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Delete failed')

      toast.success('Account deleted. You can re-register anytime.')
      setShowConfirm(false)
      await onAuthChange()
      navigate('/', { replace: true })
    } catch (e) {
      console.error(e)
      toast.error('Account deletion failed: ' + (e.message || e))
      setIsDeleting(false)
    }
  }

  return (
    <section className="page-card auth-card">
      <h1>My Account</h1>

      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f8fbff', borderRadius: '8px', border: '1px solid #e0e7ff' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Account Details</h2>
        <div style={{ display: 'grid', gap: '0.8rem' }}>
          {user.email && (
            <div>
              <strong>Email:</strong> {user.email}
            </div>
          )}
          {user.firstName && (
            <div>
              <strong>First Name:</strong> {user.firstName}
            </div>
          )}
          {user.lastName && (
            <div>
              <strong>Last Name:</strong> {user.lastName}
            </div>
          )}
          {user.company && (
            <div>
              <strong>Company:</strong> {user.company}
            </div>
          )}
          {user.username && (
            <div>
              <strong>Username:</strong> {user.username}
            </div>
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e6eef9', paddingTop: '2rem', marginTop: '2rem' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#dc2626' }}>Danger Zone</h2>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Deleting your account is permanent. You can re-register with the same email later, but your order history will be lost.
        </p>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              padding: '0.6rem 1.5rem',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            onMouseOver={(e) => e.target.style.background = '#b91c1c'}
            onMouseOut={(e) => e.target.style.background = '#dc2626'}
          >
            Delete Account
          </button>
        ) : (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem' }}>
            <p style={{ margin: '0 0 1rem 0', fontWeight: '600', color: '#991b1b' }}>
              Are you sure? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.6 : 1,
                  transition: 'background 0.15s'
                }}
                onMouseOver={(e) => !isDeleting && (e.target.style.background = '#b91c1c')}
                onMouseOut={(e) => !isDeleting && (e.target.style.background = '#dc2626')}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                style={{
                  background: '#e2e8f0',
                  color: '#334155',
                  border: 'none',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.6 : 1,
                  transition: 'background 0.15s'
                }}
                onMouseOver={(e) => !isDeleting && (e.target.style.background = '#cbd5e1')}
                onMouseOut={(e) => !isDeleting && (e.target.style.background = '#e2e8f0')}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

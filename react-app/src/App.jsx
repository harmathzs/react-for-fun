import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import InterestPage from './pages/InterestPage.jsx'
import ThanksPage from './pages/ThanksPage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import CartPage from './pages/CartPage.jsx'
import AccountPage from './pages/AccountPage.jsx'
import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Footer from './components/Footer'

export default function App() {
  const [sessionState, setSessionState] = useState({
    loading: true,
    authenticated: false,
    user: null
  })

  async function loadSession() {
    try {
      const response = await fetch('/api/session', {
        credentials: 'include'
      })
      const payload = await response.json()

      setSessionState({
        loading: false,
        authenticated: !!payload?.authenticated,
        user: payload?.user || null
      })
    } catch {
      setSessionState({
        loading: false,
        authenticated: false,
        user: null
      })
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadInitialSession() {
      try {
        const response = await fetch('/api/session', {
          credentials: 'include'
        })
        const payload = await response.json()

        if (cancelled) return

        setSessionState({
          loading: false,
          authenticated: !!payload?.authenticated,
          user: payload?.user || null
        })
      } catch {
        if (cancelled) return
        setSessionState({
          loading: false,
          authenticated: false,
          user: null
        })
      }
    }

    loadInitialSession()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleLogout() {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } finally {
      await loadSession()
    }
  }

  return (
    <div className="app-layout">
      <Navbar
        authenticated={sessionState.authenticated}
        user={sessionState.user}
        onLogout={handleLogout}
      />
      <ToastContainer position="top-right" autoClose={4000} />
      <main className="main-content">
        {sessionState.loading ? (
          <section className="page-card auth-card auth-card-sm">
            <p>Loading session...</p>
          </section>
        ) : (
        <Routes>
          <Route
            path="/"
            element={sessionState.authenticated ? <Navigate to="/shop" replace /> : <InterestPage />}
          />
          <Route
            path="/shop"
            element={sessionState.authenticated ? <ShopPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={
              sessionState.authenticated
                ? <Navigate to="/shop" replace />
                : <RegisterPage onAuthChange={loadSession} />
            }
          />
          <Route
            path="/login"
            element={
              sessionState.authenticated
                ? <Navigate to="/shop" replace />
                : <LoginPage onAuthChange={loadSession} />
            }
          />
          <Route path="/thanks" element={<ThanksPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/account"
            element={
              sessionState.authenticated
                ? <AccountPage user={sessionState.user} onAuthChange={loadSession} />
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
        )}
      </main>
      <Footer />
    </div>
  )
}

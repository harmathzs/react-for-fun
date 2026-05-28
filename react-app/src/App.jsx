import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import InterestPage from './pages/InterestPage.jsx'
import ThanksPage from './pages/ThanksPage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import './App.css'

export default function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<InterestPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/thanks" element={<ThanksPage />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} React 4 fun</p>
      </footer>
    </div>
  )
}

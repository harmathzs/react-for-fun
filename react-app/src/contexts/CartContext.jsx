import React, { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)

export function useCart() {
  return useContext(CartContext)
}

const STORAGE_KEY = 'rf_cart_v1'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
  }, [items])

  function addItem(product, qty = 1) {
    setItems(prev => {
      const found = prev.find(i => i.product.id === product.id)
      if (found) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, { product, qty }]
    })
  }

  function updateQty(productId, qty) {
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, qty: Math.max(0, qty) } : i).filter(i=>i.qty>0))
  }

  function removeItem(productId) {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }

  function clearCart() { setItems([]) }

  const subtotal = items.reduce((s, it) => s + (it.product.pricebookEntry?.unitPrice || 0) * it.qty, 0)

  const value = { items, addItem, updateQty, removeItem, clearCart, subtotal }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export default CartContext

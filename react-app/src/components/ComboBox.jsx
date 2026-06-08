import React, { useEffect, useRef, useState } from 'react'

export default function ComboBox({ items = [], placeholder = 'Pick...', onSelect }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const ref = useRef(null)

  const filtered = query.trim().length > 0
    ? items.filter(i => String(i).toLowerCase().includes(query.trim().toLowerCase()))
    : items.slice()

  useEffect(() => setHighlight(0), [query])

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function handleKey(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlight(h => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[highlight]) selectItem(filtered[highlight])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function selectItem(value) {
    setQuery(String(value))
    setOpen(false)
    if (onSelect) onSelect(value)
  }

  return (
    <div className="combobox" ref={ref}>
      <div className="combobox-input">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onKeyDown={handleKey}
          onFocus={() => setOpen(true)}
          aria-haspopup="listbox"
          aria-expanded={open}
        />
        <button type="button" className="combobox-trigger" aria-label="Toggle" onClick={() => setOpen(o => !o)}>▢</button>
      </div>

      {open && (
        <ul className="combobox-list" role="listbox">
          {filtered.length === 0 ? (
            <li className="combobox-empty">No results</li>
          ) : (
            filtered.map((it, idx) => (
              <li
                key={idx}
                role="option"
                aria-selected={highlight === idx}
                className={`combobox-item ${highlight === idx ? 'highlight' : ''}`}
                onMouseEnter={() => setHighlight(idx)}
                onMouseDown={(e) => { e.preventDefault(); selectItem(it) }}
              >
                {it}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

import React from 'react'
import DotLoader from 'react-spinners/DotLoader'

export default function LoadingButton({ isLoading, children, disabled, onClick, type = 'button', className = '' }) {
  const effectiveDisabled = Boolean(disabled) || Boolean(isLoading)

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={effectiveDisabled}
      aria-busy={isLoading}
      className={className}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      <span style={{ opacity: isLoading ? 0.6 : 1 }}>{children}</span>
      {isLoading && (
        <span style={{ display: 'inline-flex', alignItems: 'center' }} aria-hidden>
          <DotLoader size={12} color="currentColor" />
        </span>
      )}
    </button>
  )
}

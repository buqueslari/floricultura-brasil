import { useMemo, useState } from 'react'
import { assetUrl } from '../../config/site'
import type { StoreProduct } from '../../data/homepageData'

type Props = {
  products: StoreProduct[]
  query: string
  onQueryChange: (q: string) => void
  onPickProduct?: (p: StoreProduct) => void
}

export function InlineSearch({
  products,
  query,
  onQueryChange,
  onPickProduct,
}: Props) {
  const [focused, setFocused] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 12)
  }, [products, query])

  const showResults = focused && query.trim().length > 0 && filtered.length > 0
  const showNoResults = focused && query.trim().length > 0 && filtered.length === 0

  return (
    <div id="inline-search-wrap" style={{ padding: '12px 0 4px' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <svg
          style={{
            position: 'absolute',
            left: 14,
            color: '#9ca3af',
            pointerEvents: 'none',
            flexShrink: 0,
          }}
          width="17"
          height="17"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.2"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          id="inline-search-input"
          placeholder="Buscar produtos..."
          autoComplete="off"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={(e) => {
            setFocused(true)
            e.target.style.borderColor = 'var(--color-primary,#c620c6)'
            e.target.style.boxShadow =
              '0 0 0 3px rgba(var(--color-primary-rgb,198,32,198),.10)'
          }}
          onBlur={(e) => {
            setTimeout(() => setFocused(false), 200)
            e.target.style.borderColor = '#e9ecef'
            e.target.style.boxShadow = 'none'
          }}
          style={{
            width: '100%',
            padding: '9px 40px',
            border: '1.5px solid #e9ecef',
            borderRadius: 50,
            fontSize: 14,
            fontFamily: 'inherit',
            outline: 'none',
            background: '#fff',
            color: '#1f2937',
            boxSizing: 'border-box',
            transition: 'border-color .15s,box-shadow .15s',
          }}
        />
        {query ? (
          <button
            type="button"
            id="inline-clear-btn"
            onClick={() => onQueryChange('')}
            style={{
              position: 'absolute',
              right: 14,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              fontSize: 18,
              lineHeight: 1,
              padding: 2,
            }}
          >
            ×
          </button>
        ) : null}
      </div>
      {showResults ? (
        <div
          id="inline-search-results"
          style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 8px 28px rgba(0,0,0,.13)',
            marginTop: 8,
            overflow: 'hidden',
            border: '1px solid #f0f0f0',
          }}
        >
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              className="ssb-result-item"
              style={{
                display: 'flex',
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onPickProduct?.(p)
                onQueryChange('')
              }}
            >
              <img src={assetUrl(p.image)} alt="" />
              <span className="ssb-result-name">{p.name}</span>
              <span className="ssb-result-price">{p.priceFormatted}</span>
            </button>
          ))}
        </div>
      ) : null}
      {showNoResults ? (
        <div
          className="ssb-no-results"
          style={{
            background: '#fff',
            borderRadius: 16,
            marginTop: 8,
            border: '1px solid #f0f0f0',
          }}
        >
          Nenhum produto encontrado.
        </div>
      ) : null}
    </div>
  )
}

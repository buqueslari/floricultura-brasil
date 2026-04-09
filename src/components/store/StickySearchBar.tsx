import { useEffect, useState } from 'react'

type Props = {
  query: string
  onQueryChange: (q: string) => void
}

export function StickySearchBar({ query, onQueryChange }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 160)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div id="sticky-search-bar" className={visible ? 'visible' : ''}>
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <svg
          style={{
            position: 'absolute',
            left: 12,
            color: '#979797',
            pointerEvents: 'none',
          }}
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          id="ssb-input"
          placeholder="Buscar produtos..."
          autoComplete="off"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          style={{
            background: '#fff',
            color: '#2b2b2b',
          }}
        />
        {query ? (
          <button
            type="button"
            id="ssb-clear-btn"
            onClick={() => onQueryChange('')}
            style={{
              display: 'block',
              position: 'absolute',
              right: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#979797',
              fontSize: 20,
              lineHeight: 1,
              padding: 2,
            }}
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  )
}

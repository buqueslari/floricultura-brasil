import { useEffect, useMemo, useState } from 'react'
import { assetUrl } from '../../config/site'
import { getProductDetail } from '../../data/productDetail'
import type { ComplementCategory } from '../../data/productDetail'
import { useStoreCart } from '../../context/StoreCartContext'
import { formatBRL } from '../../lib/money'

const TRANSITION_MS = 320

function compSelectionKey(catId: string, itemId: string) {
  return `${catId}:${itemId}`
}

export function ProductModal() {
  const {
    productModalId,
    closeProductModal,
    addLine,
    openCart,
  } = useStoreCart()

  const product = useMemo(
    () => (productModalId != null ? getProductDetail(productModalId) : undefined),
    [productModalId],
  )

  const [sheetIn, setSheetIn] = useState(false)
  const [qty, setQty] = useState(1)
  const [observations, setObservations] = useState('')
  /** ids selecionados por categoria (ordem = ordem de clique) */
  const [selectedByCat, setSelectedByCat] = useState<Record<string, string[]>>(
    {},
  )

  useEffect(() => {
    if (productModalId == null) return undefined
    document.body.style.overflow = 'hidden'
    const t = requestAnimationFrame(() =>
      requestAnimationFrame(() => setSheetIn(true)),
    )
    return () => {
      cancelAnimationFrame(t)
      document.body.style.overflow = ''
    }
  }, [productModalId])

  const complementExtra = useMemo(() => {
    if (!product) return 0
    let sum = 0
    for (const cat of product.categories) {
      const sel = selectedByCat[cat.id] ?? []
      for (const itemId of sel) {
        const item = cat.items.find((i) => i.id === itemId)
        if (item) sum += item.price
      }
    }
    return sum
  }, [product, selectedByCat])

  const unitWithComplements = product ? product.price + complementExtra : 0
  const lineTotal = unitWithComplements * qty

  const toggleComp = (cat: ComplementCategory, itemId: string) => {
    setSelectedByCat((prev) => {
      const cur = prev[cat.id] ?? []
      const idx = cur.indexOf(itemId)
      if (idx >= 0) {
        return { ...prev, [cat.id]: cur.filter((id) => id !== itemId) }
      }
      if (cur.length >= cat.max) return prev
      return { ...prev, [cat.id]: [...cur, itemId] }
    })
  }

  const closeAnimated = () => {
    setSheetIn(false)
    window.setTimeout(() => closeProductModal(), TRANSITION_MS)
  }

  const handleAdd = () => {
    if (!product) return
    const labels: string[] = []
    for (const cat of product.categories) {
      const sel = selectedByCat[cat.id] ?? []
      for (const itemId of sel) {
        const item = cat.items.find((i) => i.id === itemId)
        if (item) labels.push(item.name)
      }
    }
    addLine({
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPrice: unitWithComplements,
      quantity: qty,
      observations: observations.trim() || undefined,
      complementSummary: labels.length ? labels.join(', ') : undefined,
    })
    closeAnimated()
    window.setTimeout(() => openCart(), TRANSITION_MS + 40)
  }

  if (!product) return null

  const handleBg = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeAnimated()
  }

  return (
    <>
      <div
        id="pm-overlay"
        role="presentation"
        onClick={handleBg}
        style={{
          display: 'flex',
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,.5)',
          zIndex: 600,
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        <div
          id="pm-sheet"
          style={{
            background: '#fff',
            borderRadius: '22px 22px 0 0',
            width: '100%',
            maxWidth: 680,
            maxHeight: '93vh',
            overflowY: 'auto',
            transform: sheetIn ? 'translateY(0)' : 'translateY(100%)',
            transition:
              'transform .32s cubic-bezier(.4,0,.2,1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ position: 'relative' }}>
            <div
              id="pm-img-wrap"
              style={{
                width: '100%',
                height: 220,
                background: '#f3f4f6',
                overflow: 'hidden',
                borderRadius: '22px 22px 0 0',
              }}
            >
              <img
                id="pm-img"
                src={assetUrl(product.image)}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
            <button
              type="button"
              onClick={closeAnimated}
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(0,0,0,.4)',
                border: 'none',
                color: '#fff',
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                backdropFilter: 'blur(4px)',
              }}
              aria-label="Fechar"
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>

          <div style={{ padding: '18px 18px 0' }}>
            <h2
              id="pm-name"
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#1f2937',
                margin: '0 0 4px',
              }}
            >
              {product.name}
            </h2>
            <p
              id="pm-desc"
              style={{
                fontSize: 13,
                color: '#6b7280',
                margin: '0 0 8px',
                whiteSpace: 'pre-line',
              }}
            >
              {product.description}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 4,
              }}
            >
              <span
                id="pm-price"
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#22c55e',
                }}
              >
                {formatBRL(product.price)}
              </span>
              {product.oldPrice != null && product.oldPrice > product.price ? (
                <span
                  id="pm-old-price"
                  style={{
                    fontSize: 14,
                    color: '#9ca3af',
                    textDecoration: 'line-through',
                  }}
                >
                  {formatBRL(product.oldPrice)}
                </span>
              ) : null}
            </div>
          </div>

          <div id="pm-complements" style={{ padding: '0 18px' }}>
            {product.categories.map((cat) => {
              const sel = selectedByCat[cat.id] ?? []
              const count = sel.length
              const subLinha =
                cat.max === 1
                  ? 'Escolha até 1 opção'
                  : `Escolha até ${cat.max} opções`
              return (
                <div key={cat.id} className="pm-cat-block">
                  <div className="pm-cat-header-strip">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <div className="pm-cat-title">{cat.name}</div>
                        <div className="pm-cat-sub">{subLinha}</div>
                      </div>
                      <span className="pm-cat-count">
                        <span className="pm-sel-count">{count}</span>/{cat.max}
                      </span>
                    </div>
                  </div>
                  <div>
                    {cat.items.map((item) => {
                      const checked = sel.includes(item.id)
                      const disabled = !checked && count >= cat.max
                      return (
                        <div
                          key={compSelectionKey(cat.id, item.id)}
                          className={`pm-comp-item${disabled ? ' disabled' : ''}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => !disabled && toggleComp(cat, item.id)}
                          onKeyDown={(e) => {
                            if (
                              (e.key === 'Enter' || e.key === ' ') &&
                              !disabled
                            ) {
                              e.preventDefault()
                              toggleComp(cat, item.id)
                            }
                          }}
                        >
                          <div>
                            <div className="pm-comp-name">{item.name}</div>
                            {item.price > 0 ? (
                              <div className="pm-comp-price-plus">
                                {`+ ${formatBRL(item.price)}`}
                              </div>
                            ) : null}
                          </div>
                          <div
                            className={`pm-comp-circle${checked ? ' checked' : ''}`}
                          >
                            {checked ? (
                              <svg
                                width="12"
                                height="12"
                                fill="none"
                                stroke="white"
                                viewBox="0 0 24 24"
                                strokeWidth="3"
                                className="pm-check-icon"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {product.allowObservations ? (
            <div
              id="pm-obs-wrap"
              style={{ padding: '0 18px', marginTop: 8 }}
            >
              <div className="pm-obs-box">
                <div className="pm-obs-label">
                  Observações{' '}
                  <span className="pm-obs-optional">(opcional)</span>
                </div>
                <textarea
                  id="pm-obs"
                  className="pm-obs-textarea"
                  rows={3}
                  maxLength={200}
                  placeholder="Algum pedido especial? Ex: sem cebola..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  autoComplete="off"
                />
                <div className="pm-obs-counter">
                  <span id="pm-obs-count">{observations.length}</span>/200
                </div>
              </div>
            </div>
          ) : null}

          <div style={{ height: 90 }} />
        </div>
      </div>

      <div
        id="pm-footer"
        style={{
          display: 'block',
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 680,
          background: '#fff',
          borderTop: '1px solid #f3f4f6',
          padding: '12px 18px',
          zIndex: 700,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              id="pm-qty-minus"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#f3f4f6',
                border: 'none',
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              −
            </button>
            <span
              id="pm-qty-display"
              style={{
                fontSize: 16,
                fontWeight: 700,
                minWidth: 24,
                textAlign: 'center',
              }}
            >
              {qty}
            </span>
            <button
              type="button"
              id="pm-qty-plus"
              onClick={() => setQty((q) => q + 1)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#f3f4f6',
                border: 'none',
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              +
            </button>
          </div>
          <button
            type="button"
            id="pm-add-btn"
            onClick={handleAdd}
            style={{
              flex: 1,
              padding: 14,
              background: '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span id="pm-add-label">
              Adicionar · {formatBRL(lineTotal)}
            </span>
          </button>
        </div>
      </div>
    </>
  )
}

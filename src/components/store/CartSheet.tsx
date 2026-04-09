import { useEffect, useState } from 'react'
import { assetUrl } from '../../config/site'
import { allProductsFlat } from '../../data/homepageData'
import { PRODUCT_DESCRIPTIONS_EXEMPLO } from '../../data/productDescriptionsFromExemplo'
import {
  MIN_ORDER_VALUE,
  useStoreCart,
} from '../../context/StoreCartContext'

const TRANSITION_MS = 320

export function CartSheet() {
  const {
    lines,
    cartOpen,
    closeCart,
    subtotal,
    formatMoney,
    addLine,
    bumpLineQuantity,
    removeLine,
    clearCart,
    canCheckout,
  } = useStoreCart()

  const [sheetIn, setSheetIn] = useState(false)
  const [view, setView] = useState<'cart' | 'upsell'>('cart')
  const [upsellAddedIds, setUpsellAddedIds] = useState<number[]>([])
  const [switchingView, setSwitchingView] = useState(false)

  useEffect(() => {
    if (!cartOpen) return undefined
    document.body.style.overflow = 'hidden'
    const t = requestAnimationFrame(() =>
      requestAnimationFrame(() => setSheetIn(true)),
    )
    return () => {
      cancelAnimationFrame(t)
      document.body.style.overflow = ''
    }
  }, [cartOpen])

  useEffect(() => {
    if (!cartOpen) {
      setView('cart')
      setUpsellAddedIds([])
    }
  }, [cartOpen])

  const closeAnimated = () => {
    setSheetIn(false)
    window.setTimeout(() => closeCart(), TRANSITION_MS)
  }

  if (!cartOpen) return null

  const handleBg = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeAnimated()
  }

  const deliveryLabel = 'Grátis'
  const upsellCandidates = [101, 102, 103, 104]
    .map((id) => allProductsFlat.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  const handleContinueCheckout = () => {
    closeAnimated()
    window.setTimeout(() => {
      globalThis.location.href = '/checkout'
    }, TRANSITION_MS)
  }

  const openUpsellAnimated = () => {
    if (switchingView) return
    setSwitchingView(true)
    setSheetIn(false)
    window.setTimeout(() => {
      setView('upsell')
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setSheetIn(true)
          setSwitchingView(false)
        }),
      )
    }, TRANSITION_MS)
  }

  const handleAddUpsell = (productId: number) => {
    const p = allProductsFlat.find((x) => x.id === productId)
    if (!p) return
    addLine({
      productId: p.id,
      name: p.name,
      image: p.image,
      unitPrice: p.price,
      quantity: 1,
    })
    setUpsellAddedIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]))
  }

  return (
    <div
      id="cart-overlay"
      role="presentation"
      onClick={handleBg}
      style={{
        display: 'flex',
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.45)',
        zIndex: 500,
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        id="cart-sheet"
        style={{
          background: '#fff',
          borderRadius: '22px 22px 0 0',
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          overflowY: 'auto',
          transform: sheetIn ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform .32s cubic-bezier(.4,0,.2,1)',
          padding: '0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '12px 0 0',
          }}
        >
          <div
            style={{
              width: 40,
              height: 4,
              background: '#e5e7eb',
              borderRadius: 2,
            }}
          />
        </div>
        {view === 'cart' ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px 14px',
              borderBottom: '1px solid #dbdbdb',
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: '#1f2937',
                margin: 0,
              }}
            >
              Seu Carrinho
            </h2>
            <button
              type="button"
              onClick={closeAnimated}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 24,
                color: '#9ca3af',
                cursor: 'pointer',
                lineHeight: 1,
                padding: 4,
              }}
              aria-label="Fechar carrinho"
            >
              ×
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px 10px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                🛒
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 900, color: '#000', margin: 0 }}>
                  Que tal alguns adicionais?
                </h2>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0px 0 0' }}>
                  Aproveite nossas ofertas
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeAnimated}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 24,
                color: '#9ca3af',
                cursor: 'pointer',
                lineHeight: 1,
                padding: 4,
              }}
              aria-label="Fechar adicionais"
            >
              ×
            </button>
          </div>
        )}

        {view === 'cart' ? (
          <div
            id="cart-items-list"
            style={{
              display: 'flex',
              gap: 10,
              flexDirection: 'column',
              padding: 20,
            }}
          >
            {lines.map((line) => (
              <div
                key={line.lineId}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  padding: 10,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 10,
                }}
              >
                <img
                  src={assetUrl(line.image)}
                  alt=""
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 10,
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#1f2937',
                      lineHeight: 1.25,
                      marginBottom: 4,
                    }}
                  >
                    {line.name}
                  </div>
                  {line.complementSummary ? (
                    <div
                      style={{
                        fontSize: 11,
                        color: '#6b7280',
                        marginBottom: 4,
                      }}
                    >
                      {line.complementSummary}
                    </div>
                  ) : null}
                  {line.observations ? (
                    <div
                      style={{
                        fontSize: 11,
                        color: '#9ca3af',
                        fontStyle: 'italic',
                        marginBottom: 4,
                      }}
                    >
                      Obs.: {line.observations}
                    </div>
                  ) : null}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 4,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: 'var(--color-primary,#ed0707)',
                        lineHeight: 1.2,
                      }}
                    >
                      {formatMoney(line.unitPrice * line.quantity)}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => bumpLineQuantity(line.lineId, -1)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          border: '1px solid #d1d5db',
                          background: '#f3f4f6',
                          cursor: 'pointer',
                          color: '#111827',
                          fontSize: 18,
                          lineHeight: '1',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        aria-label="Diminuir quantidade"
                      >
                        −
                      </button>
                      <span
                        style={{
                          fontSize: 17,
                          fontWeight: 600,
                          minWidth: 16,
                          textAlign: 'center',
                          color: '#111827',
                          lineHeight: 1,
                        }}
                      >
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => bumpLineQuantity(line.lineId, 1)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          border: '1px solid #d1d5db',
                          background: '#f3f4f6',
                          cursor: 'pointer',
                          color: '#111827',
                          fontSize: 18,
                          lineHeight: '1',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLine(line.lineId)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          border: 'none',
                          background: '#fee2e2',
                          cursor: 'pointer',
                          color: '#ef4444',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        }}
                        aria-label="Remover item"
                      >
                        <svg
                          width="15"
                          height="15"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="1.9"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 6h18"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 6l-1 14a1 1 0 01-1 1H7a1 1 0 01-1-1L5 6"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 11v6M14 11v6"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div id="upsell-list" style={{ overflowY: 'auto', flex: 1, padding: '12px 12px 8px' }}>
            {upsellCandidates.map((p) => {
              const selected = upsellAddedIds.includes(p.id)
              return (
                <div className="upsell-prod-card" key={p.id}>
                  <img className="upsell-prod-img" src={assetUrl(p.image)} alt={p.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="upsell-prod-name">{p.name}</div>
                    <div className="upsell-prod-desc">
                      {PRODUCT_DESCRIPTIONS_EXEMPLO[p.id] ??
                        'Oferta especial para complementar seu presente.'}
                    </div>
                    <div className="upsell-prod-price">{formatMoney(p.price)}</div>
                  </div>
                  <button
                    type="button"
                    className={`upsell-add-btn${selected ? ' selected' : ''}`}
                    onClick={() => handleAddUpsell(p.id)}
                    aria-label={`Adicionar ${p.name}`}
                  >
                    {selected ? '✓' : '+'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {view === 'cart' && lines.length === 0 ? (
          <div
            id="cart-empty"
            style={{ textAlign: 'center', padding: '36px 20px', color: '#9ca3af' }}
          >
            <svg
              width="52"
              height="52"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#9ca3af' }}>
              Seu carrinho está vazio
            </p>
            <p style={{ fontSize: 12, marginTop: 4 }}>
              Adicione itens para continuar
            </p>
          </div>
        ) : null}

        {view === 'cart' && lines.length > 0 ? (
          <div
            id="cart-totals"
            style={{
              padding: '18px',
              display: 'block',
              borderTop: '1px solid #e9e9e9',
              paddingTop: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 16,
                color: '#6b7280',
                marginBottom: 6,
              }}
            >
              <span>Subtotal</span>
              <span id="cart-subtotal">{formatMoney(subtotal)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 16,
                color: '#6b7280',
                marginBottom: 10,
              }}
            >
              <span>Entrega</span>
              <span
                style={{ color: '#16a34a', fontWeight: 500 }}
                id="cart-delivery"
              >
                {deliveryLabel}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 17,
                fontWeight: 600,
                color: '#1f2937',
                borderTop: '1px solid #f3f4f6',
                paddingTop: 10,
                marginBottom: 10,
              }}
            >
              <span>Total</span>
              <span id="cart-total-val">{formatMoney(subtotal)}</span>
            </div>

            <div id="min-order-wrap" style={{ marginBottom: 14 }}>
              {!canCheckout ? (
                <div
                  id="min-order-msg"
                  style={{ fontSize: 12, color: '#dc2626', marginBottom: 5 }}
                >
                  Faltam {formatMoney(MIN_ORDER_VALUE - subtotal)} para o pedido
                  mínimo
                </div>
              ) : null}
              <div
                style={{
                  background: '#f3f4f6',
                  borderRadius: 99,
                  height: 6,
                  overflow: 'hidden',
                }}
              >
                <div
                  id="min-order-bar"
                  style={{
                    height: '100%',
                    background: '#ed0707',
                    borderRadius: 99,
                    width: `${Math.min(100, (subtotal / MIN_ORDER_VALUE) * 100)}%`,
                    transition: 'width .4s',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                type="button"
                onClick={clearCart}
                style={{
                  padding: '12px 18px',
                  background: '#eeeff1',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#374151',
                }}
              >
                Limpar
              </button>
              <button
                type="button"
                id="cart-checkout-btn"
                disabled={!canCheckout}
                onClick={() => {
                  if (!canCheckout) return
                  openUpsellAnimated()
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: 14,
                  background: canCheckout ? '#ed0707' : '#e5e7eb',
                  color: canCheckout ? '#fff' : '#9ca3af',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  border: 'none',
                  cursor: canCheckout ? 'pointer' : 'not-allowed',
                  transition: 'all .2s',
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
                Finalizar compra
              </button>
            </div>

            {!canCheckout ? (
              <div
                id="min-order-hint"
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#9ca3af',
                  marginTop: 8,
                  padding: 8,
                  background: '#f9fafb',
                  borderRadius: 8,
                }}
              >
                Pedido mínimo {formatMoney(MIN_ORDER_VALUE)}
              </div>
            ) : null}
          </div>
        ) : null}

        {view === 'upsell' ? (
          <div style={{ padding: '8px 14px 14px' }}>
            <button
              type="button"
              onClick={handleContinueCheckout}
              style={{
                width: '100%',
                padding: '14px 12px',
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17"
                />
              </svg>
              {upsellAddedIds.length > 0
                ? `Continuar com ${upsellAddedIds.length} adicional${upsellAddedIds.length > 1 ? 's' : ''}`
                : 'Continuar sem adicionais'}
            </button>
            <button
              type="button"
              onClick={() => setView('cart')}
              style={{
                display: 'block',
                margin: '10px auto 0',
                background: 'none',
                border: 'none',
                color: '#22c55e',
                textDecoration: 'underline',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Ver todas as ofertas
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

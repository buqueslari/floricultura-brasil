import { useEffect, useMemo, useState } from 'react'
import { assetUrl } from '../../config/site'
import { allProductsFlat } from '../../data/homepageData'
import { useStoreCart } from '../../context/StoreCartContext'
import { formatBRL } from '../../lib/money'

type NotificationItem = {
  id: string
  person: string
  productName: string
  image: string
  price: number
  location: string
}

const FIRST_NAMES = [
  'Ana',
  'Bruno',
  'Carla',
  'Daniel',
  'Eduardo',
  'Fernanda',
  'Gustavo',
  'Helena',
  'Igor',
  'Julia',
  'Lucas',
  'Maria',
  'Nicolas',
  'Olivia',
  'Pedro',
  'Rafaela',
  'Samuel',
  'Tatiana',
  'Vitor',
  'Wesley',
]

const LAST_NAMES = [
  'Silva',
  'Santos',
  'Oliveira',
  'Souza',
  'Rodrigues',
  'Ferreira',
  'Alves',
  'Pereira',
  'Lima',
  'Gomes',
  'Costa',
  'Ribeiro',
  'Martins',
  'Cardoso',
  'Rocha',
  'Almeida',
  'Barbosa',
  'Araujo',
  'Castro',
  'Dias',
]

const LOCATIONS = ['Sao Paulo, SP', 'Guarulhos, SP', 'Santo Andre, SP', 'Osasco, SP']
const SHOW_MS = 4000
const LOOP_MS = 14000

function randomItem<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildNotification(seed: number): NotificationItem {
  const p = allProductsFlat[seed % allProductsFlat.length]
  return {
    id: `${Date.now()}-${seed}`,
    person: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
    productName: p.name,
    image: p.image,
    price: p.price,
    location: randomItem(LOCATIONS),
  }
}

export function PurchaseNotification() {
  const { cartOpen, productModalId, itemCount } = useStoreCart()
  /** Com itens no carrinho o botão flutuante ocupa a base; sem itens desce mais. */
  const bottomPx = itemCount > 0 ? 90 : 24
  const [current, setCurrent] = useState<NotificationItem | null>(null)
  const [hidden, setHidden] = useState(true)

  const paused = useMemo(() => cartOpen || productModalId != null, [cartOpen, productModalId])

  useEffect(() => {
    if (paused) {
      setHidden(true)
      return undefined
    }

    let seed = Math.floor(Math.random() * 1000)
    let hideTimer: number | undefined

    const show = () => {
      seed += 1
      setCurrent(buildNotification(seed))
      setHidden(false)
      hideTimer = window.setTimeout(() => setHidden(true), SHOW_MS)
    }

    show()
    const interval = window.setInterval(show, LOOP_MS)

    return () => {
      window.clearInterval(interval)
      if (hideTimer) window.clearTimeout(hideTimer)
    }
  }, [paused])

  if (!current) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: bottomPx,
        margin: '0 auto',
        maxWidth: 680,
        padding: '0 16px',
        zIndex: 460,
        pointerEvents: hidden ? 'none' : 'auto',
        opacity: hidden ? 0 : 1,
        transform: hidden ? 'translateY(18px)' : 'translateY(0)',
        transition: 'opacity .25s ease, transform .25s ease',
      }}
    >
      <div
        className="animate-slideUp"
        style={{
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 10px 24px rgba(0,0,0,.16)',
          padding: 12,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <img
          src={assetUrl(current.image)}
          alt={current.productName}
          style={{
            width: 74,
            height: 74,
            borderRadius: 12,
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 700,
                color: '#00b86b',
              }}
            >
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', background: '#00b86b' }}
              />
              PEDIDO REALIZADO
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#ed0707', fontSize: 12, fontWeight: 500 }}>
                {formatBRL(current.price)}
              </span>
              <button
                type="button"
                onClick={() => setHidden(true)}
                aria-label="Fechar notificação"
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#9ca3af',
                  fontSize: 22,
                  lineHeight: 1,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginTop: 2 }}>
            {current.person}
          </div>
          <div
            style={{
              fontSize: 12,
              color: '#374151',
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {current.productName}
          </div>
          <div
            style={{
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#ed0707',
              fontSize: 12,
            }}
          >
            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1116 0Z"
              />
              <circle cx="12" cy="10" r="3" strokeWidth="2" />
            </svg>
            <span>{current.location}</span>
            <span style={{ color: '#9ca3af' }}>•</span>
            <span style={{ color: '#6b7280' }}>agora mesmo</span>
          </div>
        </div>
      </div>
    </div>
  )
}


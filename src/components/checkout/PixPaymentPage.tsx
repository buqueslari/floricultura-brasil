import { useCallback, useEffect, useState } from 'react'
import {
  CHECKOUT_PIX_SESSION_KEY,
  type CheckoutPixSession,
} from '../../lib/checkoutPixSession'

/** Mesmas cores / sensação do checkout (`222.html` :root + .container-mobile) */
const checkout = {
  header: '#fd3f3f',
  accent: '#ea3434',
  pageBg: '#f5f5f5',
  text: '#111827',
  textSecondary: '#374151',
  muted: '#6b7280',
  line: '#e5e7eb',
  inpBorder: '#c9cbcf',
  cardShadow: '0 1px 6px rgba(0, 0, 0, 0.07)',
  pixSelBg: '#fdf4ff',
} as const

function fmtMoney(n: number) {
  return `R$ ${n.toFixed(2).replace('.', ',')}`
}

function BackChevron() {
  return (
    <svg width={22} height={22} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  )
}

/** Progresso igual ao step 2 do checkout (entrega ok · pagamento ativo) */
function CheckoutProgressPix() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 0 16px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: checkout.accent,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width={15} height={15} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span style={{ fontSize: 11, fontWeight: 500, color: checkout.textSecondary }}>Dados de Entrega</span>
      </div>
      <div
        style={{
          width: 68,
          height: 2,
          background: checkout.accent,
          margin: '0 -4px',
          position: 'relative',
          top: -9,
          zIndex: 1,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: checkout.accent,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          2
        </div>
        <span style={{ fontSize: 11, fontWeight: 500, color: checkout.textSecondary }}>Pagamento</span>
      </div>
    </div>
  )
}

export function PixPaymentPage() {
  const [session, setSession] = useState<CheckoutPixSession | null>(null)
  const [paid, setPaid] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CHECKOUT_PIX_SESSION_KEY)
      if (!raw) {
        window.location.replace('/checkout')
        return
      }
      const data = JSON.parse(raw) as CheckoutPixSession
      if (!data.qrCode || !data.identifier) {
        window.location.replace('/checkout')
        return
      }
      setSession(data)
    } catch {
      window.location.replace('/checkout')
    }
  }, [])

  useEffect(() => {
    if (!session?.identifier || paid) return
    const id = session.identifier
    const tick = async () => {
      try {
        const r = await fetch(
          `/api/pix-order-status?identifier=${encodeURIComponent(id)}`,
        )
        if (!r.ok) return
        const j = (await r.json()) as { payment_status?: string }
        if (j.payment_status === 'paid') {
          setPaid(true)
          sessionStorage.removeItem(CHECKOUT_PIX_SESSION_KEY)
        }
      } catch {
        /* ignorar */
      }
    }
    void tick()
    const t = window.setInterval(tick, 3500)
    return () => clearInterval(t)
  }, [session?.identifier, paid])

  const copy = useCallback(() => {
    if (!session?.qrCode) return
    void navigator.clipboard.writeText(session.qrCode).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    })
  }, [session?.qrCode])

  const font =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

  if (!session) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: checkout.pageBg,
          fontFamily: font,
        }}
      >
        <p style={{ color: checkout.muted }}>Carregando…</p>
      </div>
    )
  }

  if (paid) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: checkout.pageBg,
          fontFamily: font,
        }}
      >
        <div
          style={{
            background: checkout.header,
            color: '#fff',
            padding: '13px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 700 }}>Finalizar Pedido</span>
        </div>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 14px 40px' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: checkout.cardShadow,
              padding: '32px 24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 12 }}>✓</div>
            <h1
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: checkout.textSecondary,
                margin: '0 0 8px',
              }}
            >
              Pagamento confirmado
            </h1>
            <p style={{ fontSize: 14, color: checkout.muted, margin: '0 0 24px', lineHeight: 1.55 }}>
              Recebemos a confirmação do seu PIX. Obrigado pela compra.
            </p>
            <a
              href="/"
              style={{
                display: 'block',
                background: checkout.header,
                color: '#fff',
                fontWeight: 700,
                padding: '14px 16px',
                borderRadius: 12,
                fontSize: 15,
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Voltar à loja
            </a>
          </div>
        </div>
      </div>
    )
  }

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=248x248&data=${encodeURIComponent(session.qrCode)}`

  return (
    <div
      style={{
        minHeight: '100vh',
        background: checkout.pageBg,
        fontFamily: font,
        paddingBottom: 32,
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Header — igual ao iframe do checkout */}
        <div
          style={{
            background: checkout.header,
            color: '#fff',
            padding: '13px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <a
            href="/checkout"
            style={{
              position: 'absolute',
              left: 14,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
            aria-label="Voltar ao checkout"
          >
            <BackChevron />
          </a>
          <span style={{ fontSize: 17, fontWeight: 700 }}>Finalizar Pedido</span>
        </div>

        <CheckoutProgressPix />

        {/* Bloco “forma escolhida” estilo .pay-opt.sel */}
        <div style={{ margin: '0 14px 14px' }}>
          <div
            style={{
              border: `1.5px solid ${checkout.accent}`,
              borderRadius: 12,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: checkout.pixSelBg,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: '#f3f4f6',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: checkout.accent, letterSpacing: 0.5 }}>
                PIX
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: checkout.textSecondary }}>
                PIX
              </div>
              <div style={{ fontSize: 12, color: checkout.muted, marginTop: 2 }}>
                Escaneie o QR no app do banco ou copie o código abaixo.
              </div>
            </div>
          </div>
        </div>

        {/* Card principal — mesmo peso visual do resumo do pedido */}
        <div style={{ margin: '0 14px' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: checkout.cardShadow,
              overflow: 'hidden',
              padding: '16px 16px 20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: `1px solid ${checkout.line}`,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: checkout.textSecondary }}>
                Total a pagar
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: checkout.textSecondary }}>
                {fmtMoney(session.amount)}
              </span>
            </div>

            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: checkout.textSecondary,
                marginBottom: 6,
              }}
            >
              QR Code
            </label>
            <img
              src={qrSrc}
              width={248}
              height={248}
              alt="QR Code PIX"
              style={{
                display: 'block',
                margin: '0 auto 16px',
                borderRadius: 12,
                background: '#f9fafb',
              }}
            />

            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: checkout.textSecondary,
                marginBottom: 6,
              }}
            >
              Pix copia e cola
            </label>
            <textarea
              readOnly
              value={session.qrCode}
              rows={5}
              style={{
                width: '100%',
                fontSize: 12,
                lineHeight: 1.35,
                padding: '10px 14px',
                borderRadius: 10,
                border: `1.5px solid ${checkout.inpBorder}`,
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'ui-monospace, monospace',
                color: checkout.text,
                background: '#fff',
                outline: 'none',
              }}
            />

            <button
              type="button"
              onClick={copy}
              style={{
                marginTop: 14,
                width: '100%',
                background: checkout.header,
                color: '#fff',
                fontWeight: 700,
                padding: '14px 16px',
                borderRadius: 12,
                border: 'none',
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              {copied ? 'Copiado!' : 'Copiar código PIX'}
            </button>

            <p
              style={{
                marginTop: 16,
                fontSize: 12,
                color: checkout.muted,
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              Quando o PIX for identificado, esta página atualiza sozinha.
              {session.identifier ? (
                <>
                  {' '}
                  <span style={{ fontFamily: 'monospace', fontSize: 11 }}>#{session.identifier}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div style={{ margin: '16px 14px 0' }}>
          <a
            href="/"
            style={{
              display: 'block',
              background: '#fff',
              color: checkout.muted,
              fontWeight: 600,
              padding: '15px 16px',
              borderRadius: 12,
              border: `1.5px solid ${checkout.line}`,
              fontSize: 15,
              textDecoration: 'none',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            Voltar à loja
          </a>
        </div>
      </div>
    </div>
  )
}

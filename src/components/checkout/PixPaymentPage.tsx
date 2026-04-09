import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { buildWhatsAppComprasUrl, getWhatsAppComprasNumber } from '../../config/site'
import {
  CHECKOUT_PIX_SESSION_KEY,
  DEFAULT_CHECKOUT_ORDER_LINES,
  normalizeCheckoutPixSession,
  type CheckoutPixSession,
} from '../../lib/checkoutPixSession'

const headerRed = '#eb3434'
const pageBg = '#f5f5f5'
const text = '#111827'
const muted = '#6b7280'
const line = '#e5e7eb'
const pixBrand = '#32BCAD'
const greenBtn = '#22c55e'
const orangeBasket = '#f97316'
const cardShadow = '0 2px 12px rgba(0, 0, 0, 0.08)'

const font =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

function fmtMoney(n: number) {
  return `R$ ${n.toFixed(2).replace('.', ',')}`
}

function fmtPayUntil(ts: number): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts))
}

function BackChevron() {
  return (
    <svg
      width={22}
      height={22}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width={22} height={22} fill="none" stroke="#374151" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}

function BasketIcon() {
  return (
    <svg width={22} height={22} fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width={14} height={14} fill="none" stroke={muted} viewBox="0 0 24 24" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  )
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width={18}
      height={18}
      fill="none"
      stroke={muted}
      viewBox="0 0 24 24"
      strokeWidth={2}
      style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export function PixPaymentPage() {
  const [session, setSession] = useState<CheckoutPixSession | null>(null)
  const [paid, setPaid] = useState(false)
  const [copied, setCopied] = useState(false)
  const [itemsOpen, setItemsOpen] = useState(false)
  const receiptInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CHECKOUT_PIX_SESSION_KEY)
      if (!raw) {
        window.location.replace('/checkout')
        return
      }
      const data = normalizeCheckoutPixSession(JSON.parse(raw))
      if (!data) {
        window.location.replace('/checkout')
        return
      }
      setSession(data)
      const updated = JSON.stringify(data)
      if (updated !== raw) {
        sessionStorage.setItem(CHECKOUT_PIX_SESSION_KEY, updated)
      }
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

  const receiptMessage = useMemo(() => {
    if (!session) return ''
    const lines = [
      'Olá! Segue os dados do PIX para confirmação do comprovante.',
      '',
      `Pedido: ${session.orderDisplayId}`,
      `Valor: ${fmtMoney(session.amount)}`,
      `ID (RisePay): ${session.identifier}`,
    ]
    if (session.customerName) lines.push(`Cliente: ${session.customerName}`)
    lines.push('', 'Paguei via PIX — pode liberar o pedido. Obrigado!')
    return lines.join('\n')
  }, [session])

  const copy = useCallback(() => {
    if (!session?.qrCode) return
    void navigator.clipboard.writeText(session.qrCode).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    })
  }, [session?.qrCode])

  const openWhatsAppOnly = useCallback(() => {
    const url = buildWhatsAppComprasUrl(receiptMessage)
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }
    void navigator.clipboard.writeText(receiptMessage)
    alert(
      'Defina VITE_WHATSAPP_COMPRAS no .env com o DDD + número (só dígitos). A mensagem foi copiada.',
    )
  }, [receiptMessage])

  const onReceiptFile = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file || !session) return
      const msg = receiptMessage
      try {
        if (navigator.share && navigator.canShare?.({ files: [file], text: msg })) {
          await navigator.share({ files: [file], text: msg })
          return
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
      }
      const extra = `${msg}\n\n[Anexo: ${file.name}]`
      const url = buildWhatsAppComprasUrl(extra)
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        await navigator.clipboard.writeText(extra)
        alert(
          'Não foi possível compartilhar o arquivo. Mensagem + nome do arquivo copiados — configure VITE_WHATSAPP_COMPRAS.',
        )
      }
    },
    [receiptMessage, session],
  )

  const qrSrc = session
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(session.qrCode)}`
    : ''

  if (!session) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: pageBg,
          fontFamily: font,
        }}
      >
        <p style={{ color: muted }}>Carregando…</p>
      </div>
    )
  }

  if (paid) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: pageBg,
          fontFamily: font,
        }}
      >
        <div
          style={{
            background: headerRed,
            color: '#fff',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 0.04 }}>PAGAMENTO</span>
        </div>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 16px 40px' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              boxShadow: cardShadow,
              padding: '32px 22px',
              textAlign: 'center',
              border: `1px solid ${line}`,
            }}
          >
            <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 12, color: pixBrand }}>✓</div>
            <h1
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: text,
                margin: '0 0 8px',
              }}
            >
              Pagamento confirmado
            </h1>
            <p style={{ fontSize: 14, color: muted, margin: '0 0 24px', lineHeight: 1.55 }}>
              Recebemos a confirmação do seu PIX. Obrigado pela compra.
            </p>
            <a
              href="/"
              style={{
                display: 'block',
                background: headerRed,
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

  const lines =
    session.orderLines && session.orderLines.length > 0
      ? session.orderLines
      : DEFAULT_CHECKOUT_ORDER_LINES

  return (
    <div
      style={{
        minHeight: '100vh',
        background: pageBg,
        fontFamily: font,
        paddingBottom: 28,
      }}
    >
      <input
        ref={receiptInputRef}
        type="file"
        accept="image/*,.pdf,application/pdf"
        style={{ display: 'none' }}
        onChange={onReceiptFile}
      />

      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <header
          style={{
            background: headerRed,
            color: '#fff',
            padding: '14px 16px',
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
              left: 12,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
            aria-label="Voltar ao checkout"
          >
            <BackChevron />
          </a>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}
          >
            PAGAMENTO
          </span>
        </header>

        <div style={{ padding: '20px 16px 12px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <img
              src="/pix.svg"
              alt="Pix"
              style={{
                height: 44,
                width: 'auto',
                maxWidth: 220,
                display: 'block',
              }}
            />
          </div>
          <h1
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: text,
              margin: '0 0 8px',
              lineHeight: 1.3,
            }}
          >
            Pedido aguardando pagamento
          </h1>
          <p
            style={{
              fontSize: 13,
              color: muted,
              margin: 0,
              lineHeight: 1.45,
              padding: '0 4px',
            }}
          >
            Copie o código abaixo para pagar via Pix em qualquer aplicativo habilitado:
          </p>
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 18,
              boxShadow: cardShadow,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <img
              src={qrSrc}
              width={260}
              height={260}
              alt="QR Code PIX"
              style={{
                display: 'block',
                borderRadius: 8,
                background: '#fff',
              }}
            />
          </div>
        </div>
        <div style={{ padding: '0 16px 10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'stretch',
              gap: 0,
              background: '#eef0f2',
              border: '1px dashed #b8bcc2',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                flex: 1,
                fontSize: 11,
                lineHeight: 1.35,
                color: text,
                padding: '12px 10px 12px 12px',
                wordBreak: 'break-all',
                fontFamily: 'ui-monospace, monospace',
                maxHeight: 120,
                overflowY: 'auto',
              }}
            >
              {session.qrCode}
            </div>
            <button
              type="button"
              onClick={copy}
              aria-label="Copiar código PIX"
              style={{
                flexShrink: 0,
                width: 48,
                border: 'none',
                borderLeft: '1px dashed #b8bcc2',
                background: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CopyIcon />
            </button>
          </div>
          <p
            style={{
              fontSize: 13,
              color: muted,
              margin: '12px 0 0',
              textAlign: 'center',
            }}
          >
            Pague até: {fmtPayUntil(session.expiresAt)}
          </p>
        </div>

        <div style={{ padding: '8px 16px 14px' }}>
          <p
            style={{
              fontSize: 13,
              color: headerRed,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Caso seu pagamento não seja confirmado automaticamente em até 2 minutos após o
            pagamento, nos envie seu comprovante para liberação do pedido.
          </p>
          <button
            type="button"
            onClick={() => receiptInputRef.current?.click()}
            style={{
              marginTop: 14,
              width: '100%',
              background: headerRed,
              color: '#fff',
              fontWeight: 700,
              padding: '14px 16px',
              borderRadius: 12,
              border: 'none',
              fontSize: 15,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <DocIcon />
            Enviar comprovante
          </button>
          {getWhatsAppComprasNumber() ? (
            <button
              type="button"
              onClick={openWhatsAppOnly}
              style={{
                marginTop: 8,
                width: '100%',
                background: 'transparent',
                color: muted,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Abrir WhatsApp só com o texto do pedido
            </button>
          ) : null}
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              border: `1px solid ${line}`,
              padding: '14px 14px 12px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: orangeBasket,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BasketIcon />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: muted, marginBottom: 2 }}>Nº do pedido</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: text }}>{session.orderDisplayId}</div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginTop: 16,
                paddingTop: 14,
                borderTop: `1px solid ${line}`,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: text }}>Total</span>
              <span style={{ fontSize: 17, fontWeight: 700, color: text }}>
                {fmtMoney(session.amount)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setItemsOpen((v) => !v)}
              style={{
                width: '100%',
                marginTop: 12,
                padding: '10px 0 0',
                border: 'none',
                borderTop: `1px solid ${line}`,
                background: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 14,
                fontWeight: 600,
                color: text,
              }}
            >
              Ver itens do pedido
              <ChevronDown open={itemsOpen} />
            </button>
            {itemsOpen ? (
              <ul
                style={{
                  margin: '12px 0 0',
                  padding: '0 0 0 18px',
                  fontSize: 13,
                  color: muted,
                  lineHeight: 1.55,
                }}
              >
                {lines.map((item, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>
                    <span style={{ color: text, fontWeight: 600 }}>{item.name}</span>
                    {item.qty != null && item.qty > 0 ? ` ×${item.qty}` : ''}
                    {item.subtitle ? (
                      <div style={{ fontSize: 12, fontWeight: 400 }}>{item.subtitle}</div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div style={{ padding: '4px 16px 12px' }}>
          <button
            type="button"
            onClick={copy}
            style={{
              width: '100%',
              background: greenBtn,
              color: '#fff',
              fontWeight: 700,
              padding: '15px 16px',
              borderRadius: 12,
              border: 'none',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            {copied ? 'Copiado!' : 'Copiar código PIX'}
          </button>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 14,
              fontSize: 12,
              color: muted,
            }}
          >
            <LockIcon />
            Pagamento 100% seguro via Pix
          </div>
        </div>
      </div>
    </div>
  )
}

export const CHECKOUT_PIX_SESSION_KEY = 'checkout_pix_session'

export type CheckoutPixOrderLine = {
  name: string
  qty?: number
  subtitle?: string
}

export type CheckoutPixSession = {
  qrCode: string
  identifier: string
  status: string
  amount: number
  /** Ex.: #ACB1775722694651 */
  orderDisplayId: string
  /** Timestamp em ms (vencimento exibido “Pague até”) */
  expiresAt: number
  customerName?: string
  orderLines?: CheckoutPixOrderLine[]
}

/**
 * Mesmos itens do resumo em `public/222.html` (#sum-body .ck-item).
 * Se alterar o catálogo fixo lá, atualize aqui também.
 */
export const DEFAULT_CHECKOUT_ORDER_LINES: CheckoutPixOrderLine[] = [
  {
    name: 'Cesta Mini Romântica com Caneca, Chocolates e Buquê',
    qty: 1,
    subtitle: 'R$ 42,90',
  },
  {
    name: 'Cesta Café da Manhã Light',
    qty: 1,
    subtitle: 'R$ 69,90',
  },
]

/** Fallback em sessões antigas sem `expiresAt` válido (novo fluxo: 10 min no checkout). */
const DEFAULT_EXPIRY_MS = 10 * 60 * 1000

function isLegacyPlaceholderLines(lines: CheckoutPixOrderLine[] | undefined): boolean {
  if (!lines?.length) return true
  if (lines.length === 1) {
    const n = lines[0].name.trim().toLowerCase()
    if (
      n === 'itens do checkout' ||
      (n === 'itens do pedido' && !lines[0].subtitle)
    ) {
      return true
    }
    const sub = lines[0].subtitle ?? ''
    if (sub.includes('222.html')) return true
  }
  return false
}

/** Compatível com sessões antigas salvas antes destes campos existirem. */
export function normalizeCheckoutPixSession(raw: unknown): CheckoutPixSession | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const qrCode = typeof o.qrCode === 'string' ? o.qrCode : ''
  const identifier = typeof o.identifier === 'string' ? o.identifier : ''
  if (!qrCode || !identifier) return null
  const amount =
    typeof o.amount === 'number' && Number.isFinite(o.amount) ? o.amount : 0
  let orderDisplayId =
    typeof o.orderDisplayId === 'string' && o.orderDisplayId.trim()
      ? o.orderDisplayId.trim()
      : ''
  if (!orderDisplayId) {
    orderDisplayId = `#ACB${Date.now()}${Math.floor(Math.random() * 900 + 100)}`
  }
  let expiresAt =
    typeof o.expiresAt === 'number' && Number.isFinite(o.expiresAt)
      ? o.expiresAt
      : 0
  if (!expiresAt || expiresAt < Date.now()) {
    expiresAt = Date.now() + DEFAULT_EXPIRY_MS
  }
  let orderLines = Array.isArray(o.orderLines)
    ? (o.orderLines as CheckoutPixOrderLine[])
    : undefined
  if (isLegacyPlaceholderLines(orderLines)) {
    orderLines = DEFAULT_CHECKOUT_ORDER_LINES.slice()
  }
  return {
    qrCode,
    identifier,
    status: typeof o.status === 'string' ? o.status : '',
    amount,
    orderDisplayId,
    expiresAt,
    customerName:
      typeof o.customerName === 'string' ? o.customerName : undefined,
    orderLines,
  }
}

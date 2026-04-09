import type { CheckoutPixOrderLine } from './checkoutPixSession'
import { formatBRL } from './money'

export const CART_STORAGE_KEY = 'cesta-royal-cart-v1'

export type CartLine = {
  lineId: string
  productId: number
  name: string
  image: string
  unitPrice: number
  quantity: number
  observations?: string
  complementSummary?: string
}

function isCartLine(x: unknown): x is CartLine {
  if (x === null || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (
    typeof o.lineId !== 'string' ||
    typeof o.productId !== 'number' ||
    typeof o.name !== 'string' ||
    typeof o.image !== 'string' ||
    typeof o.unitPrice !== 'number' ||
    typeof o.quantity !== 'number' ||
    !Number.isFinite(o.unitPrice) ||
    !Number.isFinite(o.quantity) ||
    o.quantity < 1
  ) {
    return false
  }
  if (o.observations !== undefined && typeof o.observations !== 'string') {
    return false
  }
  if (
    o.complementSummary !== undefined &&
    typeof o.complementSummary !== 'string'
  ) {
    return false
  }
  return true
}

export function loadCartLinesFromLocalStorage(): CartLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCartLine)
  } catch {
    return []
  }
}

export function saveCartLinesToLocalStorage(lines: CartLine[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines))
  } catch {
    /* quota / private mode */
  }
}

export function cartLinesToPixOrderLines(lines: CartLine[]): CheckoutPixOrderLine[] {
  return lines.map((l) => {
    const unit = formatBRL(l.unitPrice)
    const total = formatBRL(l.unitPrice * l.quantity)
    let subtitle =
      l.quantity > 1 ? `${unit} × ${l.quantity} = ${total}` : unit
    const bits = [l.complementSummary, l.observations].filter(
      Boolean,
    ) as string[]
    if (bits.length) subtitle = `${subtitle} · ${bits.join(' · ')}`
    return {
      name: l.name,
      qty: l.quantity,
      subtitle,
    }
  })
}

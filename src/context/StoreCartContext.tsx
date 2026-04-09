/* eslint-disable react-refresh/only-export-components -- hook + provider no mesmo módulo */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getProductDetail } from '../data/productDetail'
import { formatBRL } from '../lib/money'

export const MIN_ORDER_VALUE = 40

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

type StoreCartContextValue = {
  lines: CartLine[]
  subtotal: number
  itemCount: number
  addLine: (line: Omit<CartLine, 'lineId'> & { lineId?: string }) => void
  updateLineQuantity: (lineId: string, quantity: number) => void
  bumpLineQuantity: (lineId: string, delta: number) => void
  removeLine: (lineId: string) => void
  clearCart: () => void
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
  productModalId: number | null
  openProductModal: (productId: number) => void
  closeProductModal: () => void
  quickAddProductId: (productId: number) => void
  formatMoney: (n: number) => string
  canCheckout: boolean
}

const StoreCartContext = createContext<StoreCartContextValue | null>(null)

export const CART_STORAGE_KEY = 'cesta-royal-cart-v1'

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

function loadCartFromStorage(): CartLine[] {
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

function saveCartToStorage(lines: CartLine[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines))
  } catch {
    /* quota / private mode */
  }
}

function newLineId() {
  return globalThis.crypto?.randomUUID?.() ?? `ln-${Date.now()}-${Math.random()}`
}

export function StoreCartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadCartFromStorage)
  const [cartOpen, setCartOpen] = useState(false)
  const [productModalId, setProductModalId] = useState<number | null>(null)

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    [lines],
  )

  const itemCount = useMemo(
    () => lines.reduce((s, l) => s + l.quantity, 0),
    [lines],
  )

  const canCheckout = subtotal >= MIN_ORDER_VALUE

  useEffect(() => {
    saveCartToStorage(lines)
  }, [lines])

  const addLine = useCallback(
    (line: Omit<CartLine, 'lineId'> & { lineId?: string }) => {
      setLines((prev) => [
        ...prev,
        { ...line, lineId: line.lineId ?? newLineId() },
      ])
    },
    [],
  )

  const updateLineQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity < 1) {
      setLines((prev) => prev.filter((l) => l.lineId !== lineId))
      return
    }
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)),
    )
  }, [])

  const bumpLineQuantity = useCallback((lineId: string, delta: number) => {
    setLines((prev) => {
      return prev
        .map((l) => {
          if (l.lineId !== lineId) return l
          const q = l.quantity + delta
          return q < 1 ? null : { ...l, quantity: q }
        })
        .filter(Boolean) as CartLine[]
    })
  }, [])

  const removeLine = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId))
  }, [])

  const clearCart = useCallback(() => {
    if (!lines.length) return
    if (!globalThis.confirm?.('Limpar o carrinho?')) return
    setLines([])
    setCartOpen(false)
  }, [lines.length])

  const quickAddProductId = useCallback(
    (productId: number) => {
      const d = getProductDetail(productId)
      if (!d) return
      if (d.categories.length > 0 || d.allowObservations) {
        setProductModalId(productId)
        return
      }
      addLine({
        productId: d.id,
        name: d.name,
        image: d.image,
        unitPrice: d.price,
        quantity: 1,
      })
    },
    [addLine],
  )

  const value = useMemo<StoreCartContextValue>(
    () => ({
      lines,
      subtotal,
      itemCount,
      addLine,
      updateLineQuantity,
      bumpLineQuantity,
      removeLine,
      clearCart,
      cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      productModalId,
      openProductModal: (id) => setProductModalId(id),
      closeProductModal: () => setProductModalId(null),
      quickAddProductId,
      formatMoney: formatBRL,
      canCheckout,
    }),
    [
      lines,
      subtotal,
      itemCount,
      addLine,
      updateLineQuantity,
      bumpLineQuantity,
      removeLine,
      clearCart,
      cartOpen,
      productModalId,
      quickAddProductId,
      canCheckout,
    ],
  )

  return (
    <StoreCartContext.Provider value={value}>{children}</StoreCartContext.Provider>
  )
}

export function useStoreCart() {
  const ctx = useContext(StoreCartContext)
  if (!ctx) throw new Error('useStoreCart must be used within StoreCartProvider')
  return ctx
}

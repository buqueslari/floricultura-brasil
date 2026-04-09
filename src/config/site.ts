/** Base da API / site (mesmos paths do exemplo.html) */
export const SITE_ASSET_BASE = 'https://cestasefloresroyal.top'

export function assetUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${SITE_ASSET_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, '')
}

/**
 * WhatsApp para comprovante (E.164 sem +, ex.: 5511999999999).
 * Defina `VITE_WHATSAPP_COMPRAS` no `.env`.
 */
export function getWhatsAppComprasNumber(): string | null {
  const raw = import.meta.env.VITE_WHATSAPP_COMPRAS as string | undefined
  const d = digitsOnly(raw ?? '')
  return d.length >= 10 ? d : null
}

export function buildWhatsAppComprasUrl(text: string): string | null {
  const n = getWhatsAppComprasNumber()
  if (!n) return null
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`
}

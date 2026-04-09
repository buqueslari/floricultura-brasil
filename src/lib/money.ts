export function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/** Ex.: "R$ 59,90" → 59.9 */
export function parseBRLLabel(label: string | undefined): number | undefined {
  if (!label) return undefined
  const cleaned = label
    .replace(/R\$\s*/i, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim()
  const n = Number.parseFloat(cleaned)
  return Number.isFinite(n) ? n : undefined
}

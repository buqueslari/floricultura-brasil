function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
}

/** Heurística para status pago na RisePay / gateways BR (ajuste conforme payloads reais). */
export function isRisepayStatusPaid(statusRaw: string): boolean {
  const s = statusRaw.trim().toLowerCase()
  if (!s) return false
  if (
    /\b(wait|pend|aguard|process|an[aá]lis)\b/.test(s) &&
    !/\b(paid|pago|aprov)\b/.test(s)
  ) {
    return false
  }
  return /\b(paid|pago|aprovado|approved|confirm|completed|success|liquid|sett|captur)\b/.test(
    s,
  )
}

export type RisepayPostbackResult = {
  identifier: string
  isPaid: boolean
  statusLabel: string
}

/**
 * postbackUrl e webhooks podem enviar envelope { object, success } ou o objeto da transação.
 */
export function parseRisepayPostback(body: unknown): RisepayPostbackResult {
  const b = asRecord(body)
  const layers = [
    b,
    asRecord(b.object),
    asRecord(b.data),
    asRecord(asRecord(b.data).object),
    asRecord(asRecord(b.data).transaction),
    asRecord(b.transaction),
  ]

  let identifier = ''
  let status = ''

  for (const layer of layers) {
    if (!identifier) {
      const id = layer.identifier ?? layer.Identifier ?? layer.id ?? layer.Id
      if (id != null && String(id).trim()) identifier = String(id).trim()
    }
    if (!status) {
      const st = layer.status ?? layer.Status ?? layer.paymentStatus
      if (st != null && String(st).trim()) status = String(st).trim()
    }
  }

  if (!identifier) {
    const flat = JSON.stringify(b)
    const m = flat.match(/"identifier"\s*:\s*"([^"]+)"/)
    if (m) identifier = m[1]
  }

  return {
    identifier,
    isPaid: isRisepayStatusPaid(status),
    statusLabel: status,
  }
}

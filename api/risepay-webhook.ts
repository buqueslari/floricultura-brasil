import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function getServiceSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return null
  return createClient(url, key)
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
}

function isRisepayStatusPaid(statusRaw: string): boolean {
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

function parseRisepayPostback(body: unknown): {
  identifier: string
  isPaid: boolean
  statusLabel: string
} {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const raw = req.body as unknown
    const parsed = parseRisepayPostback(raw)

    console.log('[risepay-webhook]', JSON.stringify({ ...parsed, rawType: typeof raw }))

    if (!parsed.identifier) {
      return res.status(200).json({ received: true, warning: 'no identifier in payload' })
    }

    if (!parsed.isPaid) {
      return res.status(200).json({
        received: true,
        identifier: parsed.identifier,
        status: parsed.statusLabel,
        updated: false,
      })
    }

    const supabase = getServiceSupabase()
    if (!supabase) {
      console.error('[risepay-webhook] SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY ausentes')
      return res.status(200).json({ received: true, warning: 'database not configured' })
    }

    const { data, error } = await supabase
      .from('users_and_caed')
      .update({ payment_status: 'paid' })
      .eq('risepay_identifier', parsed.identifier)
      .select('id')

    if (error) {
      console.error('[risepay-webhook] supabase update', error)
      return res.status(200).json({ received: true, error: error.message })
    }

    const updated = Array.isArray(data) ? data.length : 0
    if (updated === 0) {
      console.warn('[risepay-webhook] nenhuma linha com risepay_identifier=', parsed.identifier)
    }

    return res.status(200).json({
      received: true,
      identifier: parsed.identifier,
      updated,
    })
  } catch (e) {
    console.error('[risepay-webhook]', e)
    return res.status(200).json({ received: true, error: e instanceof Error ? e.message : 'err' })
  }
}

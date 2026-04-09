import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const RISEPAY_API = 'https://api.risepay.com.br'

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

/** Mesma ideia do webhook: “pago” vs “aguardando”. */
function isPaidFromStatusLabel(statusRaw: string): boolean {
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

function paidFromRisepayBody(data: unknown): boolean {
  const b = asRecord(data)
  const inner = asRecord(b.object)
  const status = String(inner.status ?? b.status ?? '').trim()
  return isPaidFromStatusLabel(status)
}

/**
 * Consulta direto na RisePay (usa o mesmo RISEPAY_SECRET do PIX).
 * Documentação: GET detalhes da transação — path típico REST.
 */
async function statusFromRisepay(identifier: string): Promise<boolean | null> {
  const secret = process.env.RISEPAY_SECRET?.trim()
  if (!secret) return null

  const path = `${RISEPAY_API}/api/External/Transactions/${encodeURIComponent(identifier.trim())}`
  try {
    const res = await fetch(path, {
      method: 'GET',
      headers: {
        Authorization: secret,
        Accept: 'application/json',
      },
    })
    if (!res.ok) return null
    const json: unknown = await res.json()
    return paidFromRisepayBody(json)
  } catch {
    return null
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const identifierRaw = req.query.identifier
  const identifier = Array.isArray(identifierRaw) ? identifierRaw[0] : identifierRaw
  if (!identifier || typeof identifier !== 'string') {
    return res.status(400).json({ error: 'Parâmetro identifier obrigatório' })
  }

  const id = identifier.trim()

  const fromRp = await statusFromRisepay(id)
  if (fromRp !== null) {
    return res.json({
      payment_status: fromRp ? 'paid' : 'pending',
      found: true,
      source: 'risepay',
    })
  }

  const supabase = getServiceSupabase()
  if (supabase) {
    const { data, error } = await supabase
      .from('users_and_caed')
      .select('payment_status')
      .eq('risepay_identifier', id)
      .maybeSingle()

    if (!error && data?.payment_status) {
      return res.json({
        payment_status: data.payment_status,
        found: true,
        source: 'supabase',
      })
    }
  }

  /** Sem Supabase e sem resposta da RisePay: não quebra a tela; só não atualiza para “pago” sozinho. */
  return res.json({
    payment_status: 'pending',
    found: false,
    source: 'unavailable',
  })
}

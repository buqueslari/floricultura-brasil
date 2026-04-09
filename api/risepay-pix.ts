import type { VercelRequest, VercelResponse } from '@vercel/node'

/** Um arquivo só: a Vercel (ESM) não inclui `api/lib/` no bundle da função. */
const RISEPAY_URL = 'https://api.risepay.com.br/api/External/Transactions'

type RisepayEnv = {
  RISEPAY_SECRET?: string
  RISEPAY_POSTBACK_URL?: string
}

type RisepayPixResult = {
  status: number
  body: Record<string, unknown>
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
}

async function risepayCreatePix(body: unknown, env: RisepayEnv): Promise<RisepayPixResult> {
  const secret = env.RISEPAY_SECRET?.trim()
  if (!secret) {
    return {
      status: 500,
      body: {
        error:
          'Defina RISEPAY_SECRET (local: .env na raiz; Vercel: Environment Variables).',
      },
    }
  }

  const b = asRecord(body)
  const amount = Number(b.amount)
  if (!Number.isFinite(amount) || amount < 4.5) {
    return {
      status: 400,
      body: { error: 'Valor inválido (mínimo R$ 4,50 na RisePay).' },
    }
  }

  const c = asRecord(b.customer)
  const name = String(c.name ?? '').trim()
  const email = String(c.email ?? '').trim()
  const phone = String(c.phone ?? '').trim()
  const cpfDigits = String(c.cpf ?? '').replace(/\D/g, '')

  if (!name || !email || !phone || cpfDigits.length !== 11) {
    return {
      status: 400,
      body: {
        error: 'Dados do cliente incompletos (nome, email, telefone e CPF).',
      },
    }
  }

  const expiresAt =
    typeof b.expiresAt === 'number' && Number.isFinite(b.expiresAt)
      ? b.expiresAt
      : 48

  const payload: Record<string, unknown> = {
    amount,
    payment: { method: 'pix', expiresAt },
    customer: { name, email, cpf: cpfDigits, phone },
  }

  if (b.externalReference != null) {
    payload.externalReference = String(b.externalReference)
  }

  const postbackUrl = env.RISEPAY_POSTBACK_URL?.trim()
  if (postbackUrl) {
    payload.postbackUrl = postbackUrl
  }

  const rpRes = await fetch(RISEPAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: secret,
    },
    body: JSON.stringify(payload),
  })

  const rpText = await rpRes.text()
  let rpJson: unknown
  try {
    rpJson = JSON.parse(rpText) as Record<string, unknown>
  } catch {
    rpJson = { raw: rpText }
  }

  const raw = rpJson as Record<string, unknown>

  if (!rpRes.ok) {
    const fromApi =
      typeof raw.message === 'string' && raw.message.trim() ? raw.message.trim() : ''

    return {
      status: rpRes.status >= 400 && rpRes.status < 600 ? rpRes.status : 502,
      body: {
        error:
          fromApi ||
          (typeof raw.error === 'string' && raw.error.trim()
            ? String(raw.error).trim()
            : 'Não foi possível criar o PIX. Tente de novo ou use outro pagamento.'),
        details: raw,
      },
    }
  }

  if (raw.success === false) {
    const msg =
      typeof raw.message === 'string' && raw.message.trim()
        ? raw.message.trim()
        : 'Operação recusada pela RisePay.'
    return {
      status: 400,
      body: { error: msg, details: raw },
    }
  }

  const inner = raw.object
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return { status: 200, body: { ...(inner as Record<string, unknown>) } }
  }

  return { status: 200, body: raw }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body: unknown = req.body
    const out = await risepayCreatePix(body, {
      RISEPAY_SECRET: process.env.RISEPAY_SECRET,
      RISEPAY_POSTBACK_URL: process.env.RISEPAY_POSTBACK_URL,
    })
    return res.status(out.status).json(out.body)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro interno'
    return res.status(500).json({ error: message })
  }
}

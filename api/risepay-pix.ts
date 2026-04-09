import type { VercelRequest, VercelResponse } from '@vercel/node'
import { risepayCreatePix } from './lib/risepay-pix-core'

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

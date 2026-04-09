import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getServiceSupabase } from '../server/supabaseService'

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

  const supabase = getServiceSupabase()
  if (!supabase) {
    return res.status(503).json({ error: 'Status indisponível (Supabase serviço não configurado).' })
  }

  const { data, error } = await supabase
    .from('users_and_caed')
    .select('payment_status')
    .eq('risepay_identifier', identifier.trim())
    .maybeSingle()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!data) {
    return res.json({ payment_status: 'pending', found: false })
  }

  return res.json({ payment_status: data.payment_status, found: true })
}

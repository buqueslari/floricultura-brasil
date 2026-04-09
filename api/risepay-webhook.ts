import type { VercelRequest, VercelResponse } from '@vercel/node'
import { parseRisepayPostback } from './lib/risepay-webhook-lib'
import { getServiceSupabase } from './lib/supabaseService'

/**
 * Configure na RisePay o postback / webhook apontando para:
 *   https://SEU_DOMINIO/api/risepay-webhook
 * e defina RISEPAY_POSTBACK_URL no mesmo valor (transação PIX inclui postbackUrl).
 */
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

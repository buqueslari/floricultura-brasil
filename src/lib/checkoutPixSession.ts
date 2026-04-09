export const CHECKOUT_PIX_SESSION_KEY = 'checkout_pix_session'

export type CheckoutPixSession = {
  qrCode: string
  identifier: string
  status: string
  amount: number
}

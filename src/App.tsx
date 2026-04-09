import { useEffect } from 'react'
import { CheckoutPage } from './components/checkout/CheckoutPage'
import { PixPaymentPage } from './components/checkout/PixPaymentPage'
import { CestaStorePage } from './components/store'
import { verifyUsersAndCaedTable } from './lib/supabase'

function App() {
  useEffect(() => {
    void verifyUsersAndCaedTable()
  }, [])

  const pathname = globalThis.location?.pathname ?? '/'
  if (pathname === '/checkout/pix') return <PixPaymentPage />
  if (pathname === '/checkout') return <CheckoutPage />

  return <CestaStorePage />
}

export default App

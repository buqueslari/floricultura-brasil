import { createClient } from '@supabase/supabase-js'

const FALLBACK_URL = 'https://uchxrfbnaofqpqzcxnyt.supabase.co'
const FALLBACK_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaHhyZmJuYW9mcXBxemN4bnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjk3OTQsImV4cCI6MjA5NDg0NTc5NH0.xbX8Co2TqisCwJcKA0m3lERV8Yq7PHYdkddEJ18bXew'

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? FALLBACK_URL
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? FALLBACK_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

let tableChecked = false

export async function verifyUsersAndCaedTable() {
  if (tableChecked) return true

  const firstCheck = await supabase.from("users_and_caed").select("id").limit(1)
  if (firstCheck.error) {
    const createTry = await supabase.rpc("ensure_users_and_caed_table")
    if (createTry.error) {
      console.error(
        `[supabase] tabela "users_and_caed" nao disponivel: ${createTry.error.message}`,
      )
      return false
    }

    const secondCheck = await supabase.from("users_and_caed").select("id").limit(1)
    if (secondCheck.error) {
      console.error(
        `[supabase] falha ao validar tabela "users_and_caed": ${secondCheck.error.message}`,
      )
      return false
    }
  }

  tableChecked = true
  return true
}

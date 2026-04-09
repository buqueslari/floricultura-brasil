import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

let tableChecked = false

export async function verifyUsersAndCaedTable() {
  if (tableChecked) return true
  if (!supabase) {
    console.warn(
      '[supabase] cliente não inicializado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes).',
    )
    return false
  }

  const firstCheck = await supabase.from('users_and_caed').select('id').limit(1)
  if (firstCheck.error) {
    const createTry = await supabase.rpc('ensure_users_and_caed_table')
    if (createTry.error) {
      console.error(
        `[supabase] tabela "users_and_caed" não disponível e não foi possível criar: ${createTry.error.message}`,
      )
      return false
    }

    const secondCheck = await supabase.from('users_and_caed').select('id').limit(1)
    if (secondCheck.error) {
      console.error(
        `[supabase] falha ao validar tabela "users_and_caed" após criação: ${secondCheck.error.message}`,
      )
      return false
    }
  }

  tableChecked = true
  return true
}


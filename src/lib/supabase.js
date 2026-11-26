
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

if (!supabaseUrl || !supabaseKey) {
  throw new Error('URL ou chave do Supabase não encontrada no .env')
}

console.log('URL do Supabase:', supabaseUrl)
console.log('Chave carregada:', supabaseKey ? 'SIM' : 'NÃO')

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)

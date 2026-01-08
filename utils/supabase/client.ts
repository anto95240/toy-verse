import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/utils/supabase/type'

// Variable pour stocker l'instance unique (Singleton)
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseClient() {
  // Si le client existe déjà, on le retourne directement
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Sinon, on le crée une seule fois
  supabaseInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return supabaseInstance
}
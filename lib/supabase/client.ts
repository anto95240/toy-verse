import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/supabase/type'

// Variable pour stocker l'instance unique (Singleton)
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseClient() {
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
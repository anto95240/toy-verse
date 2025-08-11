import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './type'

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Client singleton pour éviter les re-créations
let supabaseClient: ReturnType<typeof createSupabaseBrowserClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseBrowserClient()
  }
  return supabaseClient
}
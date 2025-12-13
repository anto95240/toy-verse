import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from './type'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // CORRECTION : Ajout du typage pour cookiesToSet
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorer l'erreur si appelée depuis un Server Component
          }
        },
      },
    }
  )
}
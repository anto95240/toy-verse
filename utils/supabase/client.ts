import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './type' // ou retire si tu n’as pas ce fichier

export const createClient = () =>
  createPagesBrowserClient<Database>()

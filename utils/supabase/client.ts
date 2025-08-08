'use client'

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './type'

export const createClient = () => createPagesBrowserClient<Database>()

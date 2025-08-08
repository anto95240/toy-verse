import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './type'

export const createClient = () => createServerComponentClient<Database>({ cookies })

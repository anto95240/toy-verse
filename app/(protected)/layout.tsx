// /app/(protected)/layout.tsx
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/utils/supabase/server'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = createServerClient()

  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    redirect('/auth')
  }

  return <>{children}</>
}

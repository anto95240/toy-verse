import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()

  if (!data.session) {
    redirect('/login')
  }

  return <>{children}</>
}

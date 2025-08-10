// app/page.tsx
import { redirect } from 'next/navigation'
import { createServerClient } from '@/utils/supabase/server'

export default async function RootPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/home')
  } else {
    redirect('/auth')
  }
}

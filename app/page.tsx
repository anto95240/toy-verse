// app/page.tsx
import { redirect } from 'next/navigation'
import { createServerClient } from '@/utils/supabase/server'

export default async function RootPage() {
  const supabase = createServerClient()
  const { data } = await supabase.auth.getSession()
  const session = data.session

  if (session) {
    redirect('/home') // si connecté, vers /home
  } else {
    redirect('/auth') // sinon vers /auth
  }
}

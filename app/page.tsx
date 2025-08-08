import { redirect } from 'next/navigation'
import { createClient } from '../utils/supabase/server'

export default async function RootPage() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()

  if (data.session) {
    redirect('/home')
  } else {
    redirect('/login')
  }
}

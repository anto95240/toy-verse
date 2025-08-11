// app/page.tsx
import { redirect } from 'next/navigation'
import { createServerClient } from '@/utils/supabase/server'

export default async function RootPage() {
  // Création du client Supabase côté serveur
  const supabase = await createServerClient()

  // Récupération de la session courante
  const {
    data: { session }
  } = await supabase.auth.getSession()

  // Si l'utilisateur est connecté, redirection vers la page /home
  if (session) {
    redirect('/home')
  } 
  // Sinon, redirection vers la page /auth
  else {
    redirect('/auth')
  }
}

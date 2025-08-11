// app/page.tsx
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export default async function RootPage() {
  // Création du client Supabase côté serveur
  const supabase = await createSupabaseServerClient()

  // Récupération de la session courante
  const { data: { user } } = await supabase.auth.getUser()

  // Si l'utilisateur est connecté, redirection vers la page /home
  if (user) {
    redirect('/home')
  } 
  // Sinon, redirection vers la page /auth
  else {
    redirect('/auth')
  }
}

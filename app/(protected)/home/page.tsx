// app/(protected)/home/page.tsx
import { createServerClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import ThemesList from '@/components/ThemeList' // component client pour UI + interactions

export default async function HomePage() {
  const supabase = createServerClient()

  // Récupère session côté serveur
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Middleware doit déjà rediriger, mais on gère au cas où
    return <div>Veuillez vous reconnecter.</div>
  }

  // Récupère thèmes de l'utilisateur côté serveur
  const { data: themes, error } = await supabase
    .from('themes')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return <div>Erreur chargement des thèmes</div>
  }

  const prenom = session.user.user_metadata?.first_name || 'Utilisateur'

  return (
    <>
      <Navbar prenom={prenom}/>
      <main className="p-8 min-h-[70vh]">
        <h1 className="text-2xl mb-6 text-center">Vos thèmes</h1>
        {/* Component client, on passe thèmes initialement */}
        <ThemesList initialThemes={themes || []} userId={session.user.id} />
      </main>
    </>
  )
}

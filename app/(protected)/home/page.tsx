// app/(protected)/home/page.tsx
import { createSupabaseServerClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import ThemesList from '@/components/ThemeList'

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()

  // Récupère session côté serveur
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    // Middleware doit déjà rediriger, mais on gère au cas où
    return <div>Veuillez vous reconnecter.</div>
  }

  // Récupère thèmes de l'utilisateur côté serveur
  const { data: themes, error } = await supabase
    .from('themes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return <div>Erreur chargement des thèmes</div>
  }

  const prenom = user.user_metadata?.first_name || 'Utilisateur'

  return (
    <>
      <Navbar prenom={prenom}/>
      <main className="main-content p-8 min-h-[70vh]">
        <h1 className="text-2xl mb-6 text-center">Vos thèmes</h1>
        <ThemesList initialThemes={themes || []} userId={user.id} />
      </main>
    </>
  )
}

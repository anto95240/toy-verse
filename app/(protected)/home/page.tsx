
// app/(protected)/home/page.tsx
import { createSupabaseServerClient } from "@/utils/supabase/server"
import HomePageClient from "./HomePageClient"

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()

  // Récupère session côté serveur
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    // Middleware doit déjà rediriger, mais on gère au cas où
    return <div>Veuillez vous reconnecter.</div>
  }

  // Récupère thèmes avec le nombre de jouets, triés par nombre de jouets décroissant
  const { data: themes, error } = await supabase
    .from("themes")
    .select(`
      *,
      toys(count)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return <div>Erreur chargement des thèmes</div>
  }

  // Trier les thèmes par nombre de jouets (décroissant)
  const sortedThemes = (themes || [])
    .map(theme => ({
      ...theme,
      toys_count: theme.toys?.[0]?.count || 0
    }))
    .sort((a, b) => b.toys_count - a.toys_count)
  const prenom = user.user_metadata?.first_name || "Utilisateur"

  return (
    <HomePageClient 
      initialThemes={sortedThemes}
      userId={user.id}
      prenom={prenom}
    />
  )
}
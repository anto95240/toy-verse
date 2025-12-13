// app/(protected)/home/page.tsx
import { createSupabaseServerClient } from "@/utils/supabase/server"
import HomePageClient from "./HomePageClient"
import { Theme } from "@/types/theme" // Assurez-vous d'importer le type de base

// Définition du type étendu pour inclure la jointure
interface ThemeWithToys extends Theme {
  toys: { count: number }[]
}

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return <div>Veuillez vous reconnecter.</div>
  }

  // Ajout de .returns<ThemeWithToys[]>() pour typer la réponse
  const { data: themes, error } = await supabase
    .from("themes")
    .select(`
      *,
      toys(count)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<ThemeWithToys[]>()

  if (error) {
    console.error(error)
    return <div>Erreur chargement des thèmes</div>
  }

  const sortedThemes = (themes || [])
    .map((theme) => ({
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
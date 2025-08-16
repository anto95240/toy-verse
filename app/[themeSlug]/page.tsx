import { createSupabaseServerClient } from "@/utils/supabase/server"
import ToyPageClient from "./ToyPageClient"
import { notFound } from "next/navigation"
import { createSlug, slugToThemeName } from "@/lib/slugUtils"

type ThemePageProps = {
  params: Promise<{
    themeSlug: string
  }>
}

export default async function ThemePage({ params }: ThemePageProps) {
  const { themeSlug } = await params
  if (!themeSlug) notFound()

  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) notFound()

  const userId = user.id

  // Convertir le slug en nom probable
  const probableThemeName = slugToThemeName(themeSlug)

  // Recherche exacte insensible à la casse
  let theme = await supabase
    .from("themes")
    .select("*")
    .eq("user_id", userId)
    .ilike("name", probableThemeName)
    .single()

  // Si pas trouvé, rechercher tous les thèmes et matcher le slug
  if (!theme.data) {
    const { data: allThemes } = await supabase
      .from("themes")
      .select("*")
      .eq("user_id", userId)

    if (allThemes) {
      const matchingTheme = allThemes.find(t => createSlug(t.name) === themeSlug)
      if (matchingTheme) {
        theme.data = matchingTheme
        theme.error = null
      }
    }
  }

  if (theme.error || !theme.data) notFound()

  const { count: toysCount, error: countError } = await supabase
    .from("toys")
    .select("*", { count: "exact", head: true })
    .eq("theme_id", theme.data.id)

  if (countError) {
    console.error("Erreur lors du comptage des jouets :", countError)
  }

  return (
    <ToyPageClient
      theme={{
        themeId: theme.data.id,
        themeName: theme.data.name,
        image_url: theme.data.image_url,
        toysCount: toysCount || 0,
      }}
    />
  )
}
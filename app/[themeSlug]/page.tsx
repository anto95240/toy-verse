import { createSupabaseServerClient } from "@/utils/supabase/server"
import ToyPageClient from "./ToyPageClient"
import { notFound } from "next/navigation"
import { createSlug, slugToThemeName } from "@/lib/slugUtils"
import type { PostgrestSingleResponse } from '@supabase/supabase-js'

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
  let themeResult: PostgrestSingleResponse<any> = await supabase
    .from("themes")
    .select("*")
    .eq("user_id", userId)
    .ilike("name", probableThemeName)
    .single()

  // Si pas trouvé, rechercher tous les thèmes et matcher le slug
  if (!themeResult.data) {
    const { data: allThemes } = await supabase
      .from("themes")
      .select("*")
      .eq("user_id", userId)

    if (allThemes) {
      const matchingTheme = allThemes.find(t => createSlug(t.name) === themeSlug)
      if (matchingTheme) {
        // Créer une réponse compatible avec PostgrestSingleResponse
        themeResult = {
          data: matchingTheme,
          error: null,
          count: null,
          status: 200,
          statusText: 'OK'
        } as PostgrestSingleResponse<any>
      }
    }
  }

  if (themeResult.error || !themeResult.data) notFound()

  const { count: toysCount, error: countError } = await supabase
    .from("toys")
    .select("*", { count: "exact", head: true })
    .eq("theme_id", themeResult.data.id)

  if (countError) {
    console.error("Erreur lors du comptage des jouets :", countError)
  }

  return (
    <ToyPageClient
      theme={{
        themeId: themeResult.data.id,
        themeName: themeResult.data.name,
        image_url: themeResult.data.image_url,
        toysCount: toysCount || 0,
      }}
    />
  )
}
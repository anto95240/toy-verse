import { createSupabaseServerClient } from "@/lib/supabase/server"
import ToyPageClient from "./ToyPageClient"
import { notFound } from "next/navigation"
import { createSlug, slugToThemeName } from "@/utils/slugUtils"
import type { PostgrestSingleResponse } from '@supabase/supabase-js'

interface ThemeData {
  id: string
  name: string
  image_url: string | null
  user_id: string
  created_at?: string
  updated_at?: string
}

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

  const probableThemeName = slugToThemeName(themeSlug)

  let themeResult: PostgrestSingleResponse<ThemeData> = await supabase
    .from("themes")
    .select("*")
    .eq("user_id", userId)
    .ilike("name", probableThemeName)
    .single()

  if (!themeResult.data) {
    const { data: allThemes } = await supabase
      .from("themes")
      .select("*")
      .eq("user_id", userId)

    if (allThemes) {
      const matchingTheme = allThemes.find((t: ThemeData) => createSlug(t.name) === themeSlug)
      if (matchingTheme) {
        themeResult = {
          data: matchingTheme,
          error: null,
          count: null,
          status: 200,
          statusText: 'OK'
        } as PostgrestSingleResponse<ThemeData>
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
        userId: userId,
      }}
    />
  )
}
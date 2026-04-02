import { createSupabaseServerClient } from "@/lib/supabase/server"
import ToyPageClient from "./ToyPageClient"
import { notFound } from "next/navigation"

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

  // TypeScript sait maintenant que 'themes' existe dans 'Database'
  const { data: theme, error: themeError } = await supabase
    .from("themes")
    .select("*")
    .eq("user_id", user.id)
    .eq("slug", themeSlug)
    .single()

  if (themeError || !theme) {
    notFound()
  }

  const { count: toysCount, error: countError } = await supabase
    .from("toys")
    .select("*", { count: "exact", head: true })
    .eq("theme_id", theme.id)

  if (countError) {
    console.error(countError)
  }

  return (
    <ToyPageClient
      theme={{
        themeId: theme.id,
        themeName: theme.name,
        image_url: theme.image_url,
        toysCount: toysCount || 0,
        userId: user.id,
      }}
    />
  )
}
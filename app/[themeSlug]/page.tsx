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
    .eq("slug", themeSlug)
    .single()

  const themeData = theme as unknown as { id: string; name: string; profile_id: string | null; image_url: string | null };

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
        themeId: themeData.id,
        themeName: themeData.name,
        profile_id: themeData.profile_id,
        image_url: themeData.image_url,
        toysCount: toysCount || 0,
        userId: user.id,
      }}
    />
  )
}
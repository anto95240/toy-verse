import { createSupabaseServerClient } from '@/utils/supabase/server'
import ToyPageClient from './ToyPageClient'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string }
}

export default async function ThemePage({ params }: Props) {
  const supabase = await createSupabaseServerClient()

  const { id } = params
  if (!id) notFound()

  // 🔹 Récupérer l'utilisateur connecté
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) notFound()

  const userId = user.id

  // 🔹 Récupérer le thème de cet utilisateur
  const { data: theme, error: themeError } = await supabase
    .from('themes')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (themeError || !theme) notFound()

  // 🔹 Compter le nombre total de jouets pour ce thème
  const { count: toysCount, error: countError } = await supabase
    .from('toys')
    .select('*', { count: 'exact', head: true })
    .eq('theme_id', theme.id)

  if (countError) {
    console.error('Erreur lors du comptage des jouets :', countError)
  }

  return (
    <ToyPageClient
      theme={{
        themeId: theme.id,
        themeName: theme.name,
        image_url: theme.image_url,
        toysCount: toysCount || 0 // on passe le total au client
      }}
      toy={null} // Pas de jouet sélectionné par défaut
    />
  )
}

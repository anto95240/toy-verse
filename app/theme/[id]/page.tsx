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

  // Récupérer utilisateur
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) notFound()

  const userId = user.id

  // Récupérer thème
  const { data: theme, error: themeError } = await supabase
    .from('themes')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (themeError || !theme) notFound()

  return (
    <ToyPageClient
      theme={{
        themeId: theme.id,
        themeName: theme.name,
        image_url: theme.image_url,
      }}
      toy={null} // Pas de jouet sélectionné par défaut
    />
  )
}

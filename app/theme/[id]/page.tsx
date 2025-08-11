import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import ThemePageClient from './ThemePageClient'
import { createSupabaseServerClient } from '@/utils/supabase/server'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ThemePage({ params }: Props) {
  const supabase = await createSupabaseServerClient()

  const { id } = await params
  if (!id) notFound()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) notFound()

  const userId = user.id

  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !data) notFound()

  return (
    <ThemePageClient
      themeId={data.id}
      themeName={data.name}
      image_url={data.image_url}
    />
  )
}
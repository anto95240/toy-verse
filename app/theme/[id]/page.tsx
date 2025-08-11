import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import ThemePageClient from './ThemePageClient'
import { createSupabaseServerClient } from '@/utils/supabase/server'

type Props = {
  params: { id: string }
}

export default async function ThemePage({ params }: Props) {
  const supabase = await createSupabaseServerClient()

  const id = params.id
  if (!id) notFound()

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) notFound()

  const userId = session.user.id

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
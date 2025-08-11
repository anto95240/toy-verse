// app/theme/[id]/page.tsx
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { notFound } from 'next/navigation'
import ThemePageClient from './ThemePageClient'
import type { Database } from '@/utils/supabase/type'

type Props = {
  params: { id: string }
}

export default async function ThemePage({ params }: Props) {
  const supabase = createServerComponentClient<Database>({ cookies })

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

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notFound } from 'next/navigation'
import ThemePageClient from './ThemePageClient'
import type { Database } from '@/utils/supabase/type'

type Props = {
  params: { id: string }
}

export default async function ThemePage({ params }: Props) {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

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
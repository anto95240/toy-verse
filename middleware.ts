import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const publicRoutes = ['/auth']
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  // Rediriger vers /auth si pas de session et route protégée
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // Rediriger vers /home si session existe et on est sur /auth
  if (session && req.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  return res
}

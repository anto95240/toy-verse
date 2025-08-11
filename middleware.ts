import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/utils/supabase/type'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

export async function middleware(req: NextRequest) {
  // Crée la réponse initiale
  const res = NextResponse.next()

  // Crée client supabase avec req et res
  const supabase = createMiddlewareClient<Database>({ req, res })

  // Récupère la session actuelle
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Routes publiques accessibles sans session
  const publicRoutes = ['/auth']

  // Si pas de session et route privée -> redirection vers /auth
  if (!session && !publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // Sinon on continue
  return res
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get('sb-access-token')?.value

  const isLoggedIn = Boolean(accessToken)
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup')

  if (!isLoggedIn && !isAuthPage) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isLoggedIn && isAuthPage) {
    const url = req.nextUrl.clone()
    url.pathname = '/home' // redirige un utilisateur déjà connecté
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Appliquer le middleware à toutes les pages sauf les fichiers publics
     */
    '/((?!_next|static|favicon.ico|.*\\..*).*)',
  ],
}

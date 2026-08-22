# Connexion Google avec Supabase — Guide d'intégration pour Jouetopia

## Vue d'ensemble

Ce guide explique comment ajouter la connexion via Google (OAuth 2.0) à ton projet **Jouetopia** qui utilise **Supabase** + **Next.js 15** avec `@supabase/ssr`.

---

## Étape 1 — Configuration côté Google Cloud Console

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet (ou sélectionner un projet existant)
3. Aller dans **APIs & Services → Credentials**
4. Cliquer **Create Credentials → OAuth client ID**
5. Choisir **Web application**
6. Remplir les champs :
   - **Nom** : `Jouetopia` (ou ce que tu veux)
   - **Authorized JavaScript origins** :
     ```
     https://<TON_PROJET>.supabase.co
     ```
   - **Authorized redirect URIs** :
     ```
     https://<TON_PROJET>.supabase.co/auth/v1/callback
     ```
     > ⚠️ Remplace `<TON_PROJET>` par ton identifiant Supabase (ex: `wvsjatjwsmixmjfmhbea`)

7. Copier le **Client ID** et le **Client Secret**

> [!IMPORTANT]
> Si tu n'as pas encore configuré l'**OAuth consent screen**, Google te demandera de le faire d'abord. Choisis **External**, remplis le nom de l'app, l'email de support, et ajoute le scope `email` et `profile`.

---

## Étape 2 — Configuration côté Supabase Dashboard

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner ton projet
3. Aller dans **Authentication → Providers**
4. Trouver **Google** et l'activer (toggle ON)
5. Coller le **Client ID** et le **Client Secret** obtenus à l'étape 1
6. Laisser le **Redirect URL** par défaut (il est affiché en haut, c'est `https://<TON_PROJET>.supabase.co/auth/v1/callback`)
7. Sauvegarder

---

## Étape 3 — Créer la route callback dans Next.js

Supabase redirige l'utilisateur après l'auth OAuth vers ton site avec un `code` dans l'URL. Tu dois créer une route API pour échanger ce code contre une session.

### Créer le fichier `app/auth/callback/route.ts`

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return response
    }
  }

  // En cas d'erreur, rediriger vers la page auth
  return NextResponse.redirect(`${origin}/auth?error=oauth_error`)
}
```

---

## Étape 4 — Mettre à jour le Redirect URL dans Supabase

Maintenant que la route callback existe, il faut dire à Supabase où renvoyer l'utilisateur.

1. Retourner sur **Supabase Dashboard → Authentication → URL Configuration**
2. Dans **Site URL**, mettre :
   ```
   https://ton-domaine.vercel.app
   ```
   (ou `http://localhost:3000` en dev)

3. Dans **Redirect URLs**, ajouter :
   ```
   https://ton-domaine.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

---

## Étape 5 — Ajouter le bouton "Se connecter avec Google" dans le LoginForm

### Modifier `components/auth/LoginForm.tsx`

Ajouter cette fonction dans le composant `LoginForm` :

```tsx
const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) {
    setError("Erreur lors de la connexion Google.")
  }
}
```

Puis ajouter le bouton dans le JSX (par exemple après le bouton "Se connecter") :

```tsx
{/* Séparateur */}
<div className="flex items-center gap-4 my-2">
  <div className="flex-1 h-px bg-border" />
  <span className="text-xs text-muted-foreground font-medium">ou</span>
  <div className="flex-1 h-px bg-border" />
</div>

{/* Bouton Google */}
<button
  type="button"
  onClick={handleGoogleLogin}
  className="w-full py-3 px-4 rounded-xl border border-border bg-card hover:bg-secondary/80 transition-all duration-200 flex items-center justify-center gap-3 font-medium text-foreground shadow-sm hover:shadow-md"
>
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
  Continuer avec Google
</button>
```

---

## Étape 6 — Mettre à jour le middleware

Le middleware (`middleware.ts`) doit autoriser la route `/auth/callback` sans redirection.

Dans le tableau `publicRoutes`, ajouter `/auth/callback` :

```ts
const publicRoutes = ['/', '/auth', '/auth/callback']
```

---

## Étape 7 — Tester

### En local
1. Lancer `npm run dev`
2. Aller sur `http://localhost:3000/auth`
3. Cliquer sur "Continuer avec Google"
4. Se connecter avec un compte Google
5. Vérifier la redirection vers `/home`

### En production
1. S'assurer que les URLs de redirect dans Google Cloud Console et Supabase incluent le domaine Vercel
2. Déployer et tester

---

## Checklist récapitulative

| # | Tâche | Fait ? |
|---|-------|--------|
| 1 | Créer les credentials OAuth dans Google Cloud Console | ☐ |
| 2 | Activer le provider Google dans Supabase Dashboard | ☐ |
| 3 | Créer `app/auth/callback/route.ts` | ☐ |
| 4 | Configurer les Redirect URLs dans Supabase | ☐ |
| 5 | Ajouter le bouton et la fonction `handleGoogleLogin` dans `LoginForm.tsx` | ☐ |
| 6 | Mettre à jour `publicRoutes` dans `middleware.ts` | ☐ |
| 7 | Tester en local et en production | ☐ |

---

## Notes importantes

> [!WARNING]
> En développement, Google OAuth peut ne pas fonctionner avec `localhost` selon ta configuration. Si c'est le cas, ajoute `http://localhost:3000` dans les **Authorized JavaScript origins** de Google Cloud Console.

> [!TIP]
> Si un utilisateur se connecte avec Google et qu'un compte avec le même email existe déjà (créé via email/password), Supabase fusionnera automatiquement les comptes **seulement si** tu as activé l'option **"Allow linking accounts with the same email"** dans **Authentication → Providers → Email** dans le Dashboard Supabase.

> [!NOTE]
> Le bouton Google peut aussi être ajouté sur la page d'inscription (`RegisterForm.tsx`) avec le même code — `signInWithOAuth` crée automatiquement le compte si l'utilisateur n'existe pas.

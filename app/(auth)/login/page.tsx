'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/home')
      }
    })
  }, [])

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return alert(error.message)
    router.push('/home')
  }

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-xl mb-4">Connexion</h1>
      <input
        type="email"
        placeholder="Email"
        className="border p-2 mb-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        className="border p-2 mb-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleLogin}
      >
        Se connecter
      </button>
      <p className="mt-2 text-sm">
        Pas encore de compte ? <Link href="/register" className="text-blue-600 underline">Créer un compte</Link>
      </p>
    </div>
  )
}

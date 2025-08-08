'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) router.replace('/home') // Redirige si déjà connecté
    }
    checkSession()
  }, [router, supabase])

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return alert(error.message)
    alert('Inscription réussie ! Veuillez vérifier votre e-mail.')
    router.push('/login')
  }

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-xl mb-4">Inscription</h1>
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
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={handleRegister}
      >
        S'inscrire
      </button>
      <p className="mt-2 text-sm">
        Déjà un compte ? <Link href="/login" className="text-blue-600 underline">Se connecter</Link>
      </p>
    </div>
  )
}

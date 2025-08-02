"use client"

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else alert('Connecté !')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <input
        type="email"
        placeholder="Email"
        className="border p-2 mb-4 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        className="border p-2 mb-4 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleLogin}>
        Se connecter
      </button>
    </div>
  )
}

// components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/utils/supabase/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = getSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    console.log('[LoginForm] Tentative de connexion avec email:', email)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (data.session) {
        console.log('[LoginForm] Connexion réussie, redirection vers /home')
        // Force le rafraîchissement de la page pour synchroniser les cookies
        window.location.href = '/home'
      } else {
        setError('Impossible de récupérer la session après connexion. Veuillez réessayer.')
      }
    } catch (err) {
      console.error('Erreur de connexion:', err)
      setError('Une erreur est survenue lors de la connexion')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
      {/* Email */}
      <div className="relative">
        <input
          type="email"
          id="login-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="peer w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder=" "
          disabled={loading}
        />
        <label
          htmlFor="login-email"
          className="absolute left-3 top-2 text-blue-500 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-blue-500 peer-placeholder-shown:text-sm"
        >
          Email
        </label>
      </div>

      {/* Mot de passe avec affichage/masquage */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="peer w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder=" "
          disabled={loading}
        />
        <label
          htmlFor="login-password"
          className="absolute left-3 top-2 text-blue-500 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-blue-500 peer-placeholder-shown:text-sm"
        >
          Mot de passe
        </label>

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-blue-500 hover:text-gray-700"
          disabled={loading}
          aria-label={showPassword ? 'Masquer mot de passe' : 'Afficher mot de passe'}
        >
          {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}

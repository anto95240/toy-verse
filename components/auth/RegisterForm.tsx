// components/auth/RegisterForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"

export default function RegisterForm() {
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: prenom,
          last_name: nom,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Parfois l'email de confirmation est envoyé, l'utilisateur n'est pas encore connecté
    // On peut tenter de récupérer la session, si c'est ok, on redirige vers /home
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      router.push('/home')
    } else {
      // Si pas de session (par exemple email de confirmation à valider), on peut rediriger vers une page d'attente
      router.push('/auth/confirm-email')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-6 max-w-md mx-auto p-4">
      {/* Prénom et Nom */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            id="prenom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            required
            className="peer w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder=" "
            disabled={loading}
          />
          <label
            htmlFor="prenom"
            className="absolute left-3 top-2 text-blue-500 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-blue-500 peer-placeholder-shown:text-sm"
          >
            Prénom
          </label>
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            id="nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="peer w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder=" "
            disabled={loading}
          />
          <label
            htmlFor="nom"
            className="absolute left-3 top-2 text-blue-500 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-blue-500 peer-placeholder-shown:text-sm"
          >
            Nom
          </label>
        </div>
      </div>

      {/* Email */}
      <div className="relative">
        <input
          type="email"
          id="register-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="peer w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder=" "
          disabled={loading}
        />
        <label
          htmlFor="register-email"
          className="absolute left-3 top-2 text-blue-500 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-blue-500 peer-placeholder-shown:text-sm"
        >
          Email
        </label>
      </div>

      {/* Mot de passe */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id="register-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="peer w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          placeholder=" "
          disabled={loading}
        />
        <label
          htmlFor="register-password"
          className="absolute left-3 top-2 text-blue-500 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-blue-500 peer-placeholder-shown:text-sm"
        >
          Mot de passe
        </label>

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-gray-700"
          disabled={loading}
          aria-label={showPassword ? 'Masquer mot de passe' : 'Afficher mot de passe'}
        >
          {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        className="bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Inscription en cours..." : "S'inscrire"}
      </button>
    </form>
  )
}

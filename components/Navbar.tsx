// components/Navbar.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightToBracket, faBars, faXmark } from '@fortawesome/free-solid-svg-icons'
import SearchBar from './search/SearchBar'

type NavbarProps = {
  prenom?: string
  onLogout?: () => void
}

export default function Navbar({ prenom, onLogout }: NavbarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = getSupabaseClient()

  async function handleLogout() {
    if (onLogout) {
      onLogout()
    } else {
      await supabase.auth.signOut()
      window.location.href = '/auth'
    }
  }

  return (
    <nav className="bg-blue-600 text-white px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo + Nom */}
        <div className="flex items-center gap-2 font-bold text-lg">
          <Image
            src="/images/logo.webp"
            alt="ToyVerse Logo"
            width={40}
            height={40}
            className="rounded-3xl"
          />
          <span>ToyVerse</span>
        </div>

        {/* Bouton hamburger visible uniquement sur mobile */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Fermer menu' : 'Ouvrir menu'}
        >
          <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
        </button>

        {/* Menu principal visible sur desktop */}
        <div className="hidden md:flex flex-1 mx-6 items-center justify-between">
          {/* Barre de recherche */}
          <SearchBar className="hidden md:flex flex-1 max-w-lg mx-auto min-w-0" />

          {/* Message + Bouton déconnexion */}
          <div className="flex items-center gap-4 whitespace-nowrap">
            <span>Bonjour, <strong>{prenom}</strong></span>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Déconnexion"
              title="Se déconnecter"
              className="px-3 py-1 rounded transition hover:bg-blue-700"
            >
              <FontAwesomeIcon className="text-red-700 w-6 h-6" icon={faRightToBracket} />
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile (affiché si menuOpen) */}
      {menuOpen && (
        <div className="md:hidden mt-3 space-y-4">
          <SearchBar className="flex" />

          <div className="flex items-center justify-between">
            <span>Bonjour, <strong>{prenom}</strong></span>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Déconnexion"
              title="Se déconnecter"
              className="px-3 py-1 rounded transition hover:bg-blue-700"
            >
              <FontAwesomeIcon className="text-red-700 w-6 h-6" icon={faRightToBracket} />
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

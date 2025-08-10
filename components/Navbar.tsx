// components/Navbar.tsx
'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRightToBracket, faBars, faXmark } from "@fortawesome/free-solid-svg-icons"

type NavbarProps = {
  prenom?: string
  onLogout: () => void
}

export default function Navbar({ prenom = 'Utilisateur', onLogout }: NavbarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Recherche lancée pour : ${searchTerm}`)
  }

  return (
    <nav className="bg-blue-600 text-white px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo + Nom */}
        <div className="flex items-center gap-2 font-bold text-lg">
          <img
            src="/images/logo.webp"
            alt="ToyVerse Logo"
            className="w-10 h-10 rounded-3xl"
            width={40}
            height={40}
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
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg mx-auto" style={{ minWidth: 0 }}>
            <input
              type="search"
              placeholder="Rechercher..."
              aria-label="Recherche"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow rounded-l-md px-3 py-1 text-black focus:outline-none"
            />
            <button
              type="submit"
              disabled={!searchTerm.trim()}
              className="bg-white text-blue-600 px-4 rounded-r-md hover:bg-gray-200"
            >
              Chercher
            </button>
          </form>

          {/* Message + Bouton déconnexion */}
          <div className="flex items-center gap-4 whitespace-nowrap">
            <span>Bonjour, <strong>{prenom}</strong></span>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Déconnexion"
              title="Se déconnecter"
              className="px-3 py-1 rounded transition"
            >
              <FontAwesomeIcon className="text-red-700 w-6 h-6" icon={faRightToBracket} />
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile (affiché si menuOpen) */}
      {menuOpen && (
        <div className="md:hidden mt-3 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="search"
              placeholder="Rechercher..."
              aria-label="Recherche"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow rounded-l-md px-3 py-1 text-black focus:outline-none"
            />
            <button
              type="submit"
              disabled={!searchTerm.trim()}
              className="bg-white text-blue-600 px-4 rounded-r-md hover:bg-gray-200"
            >
              Chercher
            </button>
          </form>

          <div className="flex items-center justify-between">
            <span>Bonjour, <strong>{prenom}</strong></span>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Déconnexion"
              title="Se déconnecter"
              className="px-3 py-1 rounded transition"
            >
              <FontAwesomeIcon className="text-red-700 w-6 h-6" icon={faRightToBracket} />
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

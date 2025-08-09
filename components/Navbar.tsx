'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";

type NavbarProps = {
  prenom: string
  onLogout: () => void
}

export default function Navbar({ prenom, onLogout }: NavbarProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Recherche lancée pour : ${searchTerm}`)
    // Ici tu peux ajouter la logique de recherche
  }

  return (
    <nav className="flex items-center justify-between bg-blue-600 text-white px-6 py-3">
      {/* Logo + Nom */}
      <div className="flex items-center gap-2 font-bold text-lg">
        <img
          src="/images/logo.webp"
          alt="ToyVerse Logo"
          className="w-10 h-10 rounded-3xl"
        />
        <span>ToyVerse</span>
      </div>

      {/* Barre de recherche */}
      <form onSubmit={handleSearchSubmit} className="flex flex-1 max-w-lg mx-6">
        <input
          type="search"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow rounded-l-md px-3 py-1 text-black focus:outline-none"
        />
        <button
          type="submit"
          className="bg-white text-blue-600 px-4 rounded-r-md hover:bg-gray-200"
        >
          Chercher
        </button>
      </form>

      {/* Message + Bouton déconnexion */}
      <div className="flex items-center gap-4">
        <span>Bonjour, <strong>{prenom}</strong></span>
        <button
          onClick={onLogout}
          className="px-3 py-1 rounded transition"
        >
          <FontAwesomeIcon className='text-red-700 w-6 h-6' icon={faRightToBracket}/>
        </button>
      </div>
    </nav>
  )
}

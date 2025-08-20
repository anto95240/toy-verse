// components/Navbar.tsx
'use client'

import { useState } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightToBracket, faBars, faXmark, faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import SearchBar from './search/SearchBar'
import { Toy } from '@/types/theme'
import { useTheme } from '@/hooks/useTheme'

type NavbarProps = {
  prenom?: string
  onLogout?: () => void
  onSearchResults?: (results: (Toy & { theme_name: string })[]) => void
  themeId?: string
  isGlobal?: boolean
}

export default function Navbar({ prenom, onLogout, onSearchResults, themeId }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = getSupabaseClient()
  const { theme, toggleTheme } = useTheme()

  async function handleLogout() {
    if (onLogout) {
      onLogout()
    } else {
      await supabase.auth.signOut()
      window.location.href = '/auth'
    }
  }

  return (
    <>
      {/* Navbar fixe avec effet glass */}
      <nav className="navbar-fixed glass-effect backdrop-blur-xl text-text-prim px-6 py-4 fixed top-0 left-0 right-0 z-50 border-b border-border-color">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo + Nom */}
          <div className="flex items-center gap-3 font-bold text-xl">
            <div className="relative">
              <Image
                src="/images/logo.webp"
                alt="ToyVerse Logo"
                width={45}
                height={45}
                className="rounded-2xl glow-effect"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-btn-add to-btn-choix opacity-20 blur-sm"></div>
            </div>
            <span className="bg-gradient-to-r from-btn-add to-btn-choix bg-clip-text text-transparent">
              ToyVerse
            </span>
          </div>

          {/* Bouton hamburger visible uniquement sur mobile */}
          <button
            className="md:hidden neo-button px-3 py-2 rounded-xl border border-border-color hover:border-btn-add transition-all duration-300"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Fermer menu' : 'Ouvrir menu'}
          >
            <FontAwesomeIcon 
              icon={menuOpen ? faXmark : faBars} 
              className="w-5 h-5 text-text-prim"
            />
          </button>

          {/* Menu principal visible sur desktop */}
          <div className="hidden md:flex flex-1 mx-8 items-center justify-between">
            {/* Barre de recherche */}
            <SearchBar 
              className="hidden md:flex flex-1 max-w-2xl mx-auto min-w-0"
              placeholder="Rechercher un jouet..."
              onSearchResults={onSearchResults}
              themeId={themeId}
            />

            {/* Message + Boutons */}
            <div className="flex items-center gap-6 whitespace-nowrap">
              <span className="text-text-prim">
                Bonjour, <strong className="text-btn-add">{prenom}</strong>
              </span>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
                  title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
                  className="neo-button p-3 rounded-xl modern-card hover:glow-effect transition-all duration-300 group"
                >
                  <FontAwesomeIcon 
                    className="text-btn-choix w-5 h-5 group-hover:scale-110 transition-transform duration-300" 
                    icon={theme === 'light' ? faMoon : faSun} 
                  />
                </button>
                
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Déconnexion"
                  title="Se déconnecter"
                  className="neo-button p-3 rounded-xl modern-card hover:border-red-500 transition-all duration-300 group"
                >
                  <FontAwesomeIcon 
                    className="text-red-500 w-5 h-5 group-hover:scale-110 transition-transform duration-300" 
                    icon={faRightToBracket} 
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Menu mobile (affiché si menuOpen) */}
        {menuOpen && (
          <div className="md:hidden mt-6 space-y-6 pb-6 border-t border-border-color slide-in-right">
            <SearchBar 
              className="flex mt-6"
              placeholder="Rechercher un jouet..."
              onSearchResults={onSearchResults}
              themeId={themeId}
            />

            <div className="flex items-center justify-between">
              <span className="text-text-prim">
                Bonjour, <strong className="text-btn-add">{prenom}</strong>
              </span>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
                  title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
                  className="neo-button p-3 rounded-xl modern-card hover:glow-effect transition-all duration-300"
                >
                  <FontAwesomeIcon 
                    className="text-btn-choix w-5 h-5" 
                    icon={theme === 'light' ? faMoon : faSun} 
                  />
                </button>
                
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Déconnexion"
                  title="Se déconnecter"
                  className="neo-button p-3 rounded-xl modern-card hover:border-red-500 transition-all duration-300"
                >
                  <FontAwesomeIcon 
                    className="text-red-500 w-5 h-5" 
                    icon={faRightToBracket} 
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer pour compenser la navbar fixe */}
      <div className={`transition-all duration-500 ${
        menuOpen 
          ? 'h-[220px] md:h-[88px]'
          : 'h-[88px]'
      }`}></div>
    </>
  )
}
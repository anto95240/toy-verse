"use client"

import Link from "next/link"
import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSignOutAlt, faSearch } from "@fortawesome/free-solid-svg-icons"
import { getSupabaseClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import ThemeToggle from "@/components/common/ThemeToggle"

interface NavbarProps {
  prenom?: string
  onSearchResults?: (results: any[]) => void
  themeId?: string
  isGlobal?: boolean
}

export default function Navbar({ prenom, onSearchResults, themeId, isGlobal = false }: NavbarProps) {
  const router = useRouter()
  const supabase = getSupabaseClient()
  
  // Gestion de la recherche (visible uniquement Desktop maintenant)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSearchResults) return

    if (!searchTerm.trim()) {
      onSearchResults([])
      return
    }

    // Logique de recherche simple
    const { data, error } = await supabase
      .from('toys')
      .select('*')
      .ilike('nom', `%${searchTerm}%`)
    
    if (!error && data) {
      // On simule le theme_name car on est en global ou local
      const results = data.map(t => ({ ...t, theme_name: 'Résultat' }))
      onSearchResults(results)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/home" className="font-title text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
              ToyVerse
            </Link>
          </div>

          {/* BARRE DE RECHERCHE (DESKTOP ONLY) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Rechercher un jouet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-2.5 text-gray-400" />
            </form>
          </div>

          {/* ACTIONS DROITE */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {prenom && (
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bonjour, {prenom}
              </span>
            )}
            
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              title="Déconnexion"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
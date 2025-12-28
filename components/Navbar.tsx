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
  
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSearchResults) return

    if (!searchTerm.trim()) {
      onSearchResults([])
      return
    }

    const { data, error } = await supabase
      .from('toys')
      .select('*')
      .ilike('nom', `%${searchTerm}%`)
    
    if (!error && data) {
      const results = data.map(t => ({ ...t, theme_name: 'Résultat' }))
      onSearchResults(results)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  return (
    // MODIFICATION: Utilisation de bg-background/80 et border-border
    <nav className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/home" className="font-title text-2xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-bold">
              ToyVerse
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              {/* MODIFICATION: Input avec bg-secondary et text-foreground */}
              <input
                type="text"
                placeholder="Rechercher un jouet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary text-foreground border-none focus:ring-2 focus:ring-ring transition-all text-sm placeholder:text-muted-foreground"
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-2.5 text-muted-foreground" />
            </form>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />

            {prenom && (
              <span className="hidden md:block text-sm font-medium text-foreground border-l pl-4 border-border h-6 leading-6">
                Bonjour, {prenom}
              </span>
            )}
            
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
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
"use client"

import Link from "next/link"
import React, { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faSignOutAlt, 
  faUser, 
  faChevronDown,  
  faBars, 
  faTimes 
} from "@fortawesome/free-solid-svg-icons"
import { getSupabaseClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import ThemeToggle from "@/components/common/ThemeToggle"
import SearchBar from "./search/SearchBar"
import { createSlug } from "@/lib/slugUtils"
import type { Theme } from "@/types/theme"

interface NavbarProps {
  prenom?: string
  onSearchResults?: (results: any[]) => void
  themeId?: string
  isGlobal?: boolean
}

export default function Navbar({ prenom, onSearchResults, themeId, isGlobal = false }: NavbarProps) {
  const router = useRouter()
  const supabase = getSupabaseClient()
  
  const [themes, setThemes] = useState<Theme[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileThemesOpen, setIsMobileThemesOpen] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchThemes = async () => {
      const { data, error } = await supabase.from('themes').select('*').order('name')
      if (!error && data) setThemes(data)
    }
    fetchThemes()
  }, [supabase])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  return (
    <nav className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-4 lg:gap-8">
            {/* BURGER MENU (Tablette uniquement maintenant grâce à BottomNav) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hidden md:block lg:hidden p-2 -ml-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
              aria-label="Menu"
            >
              <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="text-lg" />
            </button>

            <Link href="/home" className="group flex items-center gap-2">
              <span className="font-title text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                ToyVerse
              </span>
            </Link>

            {/* NAV DESKTOP */}
            <div className="hidden lg:flex items-center gap-6 ml-4">
              <Link href="/home" className="group flex items-center gap-2 hover:text-primary transition-colors">
                <span className="font-title text-lg">Accueil</span>
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:text-primary transition-colors focus:outline-none group"
                >
                  <span className="font-title text-lg">Thèmes</span>
                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className={`text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-4 w-64 rounded-xl border border-border bg-card shadow-xl py-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/30 mb-2">
                      Vos Collections
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {themes.length > 0 ? (
                        themes.map((theme) => (
                          <Link
                            key={theme.id}
                            href={`/${createSlug(theme.name)}`}
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center px-4 py-3 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary"
                          >
                            {theme.name}
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-muted-foreground italic">Aucun thème trouvé</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isGlobal && onSearchResults && (
            <div className="hidden md:block flex-1 max-w-xl mx-8">
              <SearchBar onResults={onSearchResults} />
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {prenom && (
              <Link 
                href="/profile"
                className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors lg:border-l lg:pl-4 border-border h-6"
              >
                <div className="w-8 h-8 lg:w-7 lg:h-7 rounded-full bg-secondary flex items-center justify-center text-primary border border-border">
                  <FontAwesomeIcon icon={faUser} className="text-sm lg:text-xs" />
                </div>
                <span className="hidden lg:inline">{prenom}</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              aria-label="deconnexion"
              className="flex p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* MENU MOBILE BURGER */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 top-16 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          <div className="lg:hidden absolute top-16 left-0 w-full h-auto max-h-[calc(100vh-64px)] bg-background border-t border-border rounded-b-sm z-50 overflow-y-auto shadow-xl">
            <div className="p-3 space-y-2">
              
              <Link 
                href="/home" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-all shadow-sm"
              >
                <span className="font-semibold text-sm pl-1">Accueil</span>
              </Link>

              <div className="pt-1">
                <button 
                  onClick={() => setIsMobileThemesOpen(!isMobileThemesOpen)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all shadow-sm ${
                    isMobileThemesOpen 
                      ? 'bg-secondary/50 border-primary/30' 
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <span className="font-semibold text-sm pl-1">Thèmes & Collections</span>
                  <FontAwesomeIcon icon={faChevronDown} className={`text-xs mr-1 transition-transform ${isMobileThemesOpen ? "rotate-180" : ""}`} />
                </button>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isMobileThemesOpen ? 'max-h-[50vh] opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}>
                  <div className="space-y-1 pl-1">
                    {themes.length > 0 ? (
                      themes.map((theme) => (
                        <Link
                          key={theme.id}
                          href={`/${createSlug(theme.name)}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary/50 rounded-md transition-colors border-l-2 border-transparent hover:border-primary ml-2"
                        >
                          {theme.name}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-xs text-muted-foreground italic text-center">Aucun thème</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
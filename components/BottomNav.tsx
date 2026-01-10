"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter, useParams } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHome, faSearch, faUser, faPlus, faLayerGroup, faTimes, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import SearchOverlay from "@/components/search/SearchOverlay"
import { getSupabaseClient } from "@/utils/supabase/client"
import { createSlug } from "@/lib/slugUtils"
import type { Theme } from "@/types/theme"

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isThemesOpen, setIsThemesOpen] = useState(false)
  const [themes, setThemes] = useState<Theme[]>([])
  
  const supabase = getSupabaseClient()

  const isActive = (path: string) => pathname === path

  useEffect(() => {
    if (isThemesOpen && themes.length === 0) {
      const fetchThemes = async () => {
        const { data } = await supabase.from('themes').select('*').order('name')
        if (data) setThemes(data)
      }
      fetchThemes()
    }
  }, [isThemesOpen, themes.length, supabase])

  const handleAddClick = () => {
    // 1. Si on est dans un Thème (URL contient un slug), on veut Ajouter un Jouet
    if (params?.themeSlug) {
      const separator = window.location.search ? '&' : '?'
      router.push(`${window.location.pathname}${window.location.search}${separator}action=add`, { scroll: false })
      return
    }

    // 2. Si on est sur l'Accueil, on veut Ajouter un Thème
    if (pathname === '/home' || pathname === '/') {
       const separator = window.location.search ? '&' : '?'
       router.push(`${window.location.pathname}${window.location.search}${separator}action=add`, { scroll: false })
       return
    }

    // 3. Sinon (ex: Profil), on demande à l'utilisateur de se diriger
    alert("Pour ajouter un élément, veuillez vous rendre sur l'Accueil (Thème) ou dans une Collection (Jouet).")
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border md:hidden z-30 flex items-center justify-around pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)] transition-all duration-300">
        
        <Link 
          href="/home" 
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive('/home') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <FontAwesomeIcon icon={faHome} className="text-xl mb-1" />
          <span className="text-[10px] font-medium">Accueil</span>
        </Link>

        <button 
          onClick={() => setIsThemesOpen(true)}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isThemesOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <FontAwesomeIcon icon={faLayerGroup} className="text-xl mb-1" />
          <span className="text-[10px] font-medium">Thèmes</span>
        </button>

        <div className="relative -top-6">
          <button 
             onClick={handleAddClick}
             className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-full text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
             aria-label="Ajouter"
          >
            <FontAwesomeIcon icon={faPlus} className="text-2xl" />
          </button>
        </div>

        <button 
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <FontAwesomeIcon icon={faSearch} className="text-xl mb-1" />
          <span className="text-[10px] font-medium">Recherche</span>
        </button>

        <Link 
          href="/profile" 
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <FontAwesomeIcon icon={faUser} className="text-xl mb-1" />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </div>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {isThemesOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsThemesOpen(false)}></div>
          <div className="bg-background rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto relative animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
              <h3 className="font-title font-bold text-lg">Vos Thèmes</h3>
              <button 
                onClick={() => setIsThemesOpen(false)} 
                aria-label="fermer la popup"
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="space-y-2 pb-safe">
              {themes.length > 0 ? (
                themes.map(theme => (
                  <Link 
                    key={theme.id}
                    href={`/${createSlug(theme.name)}`}
                    onClick={() => setIsThemesOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary active:bg-primary/5 transition-colors"
                  >
                    <span className="font-medium">{theme.name}</span>
                    <FontAwesomeIcon icon={faChevronRight} className="text-xs text-muted-foreground" />
                  </Link>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Chargement des thèmes...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
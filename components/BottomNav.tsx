"use client"

import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHome, faSearch, faUser, faPlus, faLayerGroup, faTimes, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import SearchOverlay from "@/components/search/SearchOverlay"
import { createSlug } from "@/lib/slugUtils"
import { useBottomNav } from "@/hooks/useBottomNav"
import NavButton from "@/components/ui/NavButton"

export default function BottomNav() {
  const { isSearchOpen, setIsSearchOpen, isThemesOpen, setIsThemesOpen, themes, handleAddClick, isActive } = useBottomNav()

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border md:hidden z-30 flex items-center justify-around pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <NavButton href="/home" icon={faHome} label="Accueil" isActive={isActive('/home')} /> 
        <NavButton onClick={() => setIsThemesOpen(true)} icon={faLayerGroup} label="Thèmes" isActive={isThemesOpen} />
        <div className="relative -top-6">
          <button onClick={handleAddClick} className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-full text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95" aria-label="Ajouter">
            <FontAwesomeIcon icon={faPlus} className="text-2xl" />
          </button>
        </div>

        <NavButton onClick={() => setIsSearchOpen(true)} icon={faSearch} label="Recherche" />
        <NavButton href="/profile" icon={faUser} label="Profil" isActive={isActive('/profile')} />
      </div>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {isThemesOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsThemesOpen(false)} />
          <div className="bg-background rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto relative animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
              <h3 className="font-title font-bold text-lg">Vos Thèmes</h3>
              <button onClick={() => setIsThemesOpen(false)} aria-label="ferme la popup" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><FontAwesomeIcon icon={faTimes} /></button>
            </div>
            <div className="space-y-2 pb-safe">
              {themes.length > 0 ? themes.map(t => (
                <Link key={t.id} href={`/${createSlug(t.name)}`} onClick={() => setIsThemesOpen(false)} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary active:bg-primary/5 transition-colors">
                  <span className="font-medium">{t.name}</span>
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs text-muted-foreground" />
                </Link>
              )) : <p className="text-center text-muted-foreground py-4">Chargement...</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
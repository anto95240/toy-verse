"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHome, faSearch, faUser, faPlusCircle } from "@fortawesome/free-solid-svg-icons"
import SearchOverlay from "@/components/search/SearchOverlay"

export default function BottomNav() {
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* MODIFICATION: bg-card, border-border */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border md:hidden z-50 flex items-center justify-around pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)] transition-colors duration-300">
        <Link 
          href="/home" 
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive('/home') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <FontAwesomeIcon icon={faHome} className="text-xl mb-1" />
          <span className="text-[10px] font-medium">Accueil</span>
        </Link>

        <button 
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <FontAwesomeIcon icon={faSearch} className="text-xl mb-1" />
          <span className="text-[10px] font-medium">Recherche</span>
        </button>

        <div className="relative -top-6">
          <Link 
             href="/add-toy"
             className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-full text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
          >
            <FontAwesomeIcon icon={faPlusCircle} className="text-2xl" />
          </Link>
        </div>

        <Link 
          href="/profile" 
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <FontAwesomeIcon icon={faUser} className="text-xl mb-1" />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </div>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
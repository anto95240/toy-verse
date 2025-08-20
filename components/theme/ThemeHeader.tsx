"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faXmark, faHome, faChevronRight } from "@fortawesome/free-solid-svg-icons"

interface ThemeHeaderProps {
  themeName: string
  filteredToysCount: number
  totalToysCount?: number
  showMobileFilters: boolean
  onToggleMobileFilters: () => void
}

export default function ThemeHeader({
  themeName,
  filteredToysCount,
  totalToysCount,
  showMobileFilters,
  onToggleMobileFilters
}: ThemeHeaderProps) {
  const router = useRouter()

  const displayText = totalToysCount
    ? `${filteredToysCount} jouet${filteredToysCount > 1 ? 's' : ''} affiché${filteredToysCount > 1 ? 's' : ''} sur ${totalToysCount} total`
    : `${filteredToysCount} jouet${filteredToysCount > 1 ? 's' : ''}`

  return (
    <div className="space-y-6 mb-8">
      {/* Section boutons d'action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => router.push("/home")}
          className="neo-button modern-card px-6 py-3 text-text-prim border border-border-color rounded-xl hover:border-btn-retour hover:glow-effect transition-all duration-300 flex items-center gap-3 group"
        >
          <FontAwesomeIcon 
            icon={faHome} 
            className="w-4 h-4 group-hover:text-btn-retour transition-colors duration-300" 
          />
          <span className="font-medium group-hover:text-btn-retour transition-colors duration-300">
            Retour aux thèmes
          </span>
        </button>

      {/* Fil d'Ariane moderne */}
      <div className="space-y-4">
        <nav className="flex items-center gap-2 text-sm" aria-label="breadcrumb">
          <button 
            onClick={() => router.push("/home")} 
            className="flex items-center gap-2 text-text-second hover:text-btn-add transition-colors duration-300 font-medium"
          >
            <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
            Accueil
          </button>
          
          <FontAwesomeIcon 
            icon={faChevronRight} 
            className="w-3 h-3 text-border-color" 
          />
          
          <span className="text-text-prim font-bold bg-gradient-to-r from-btn-add to-btn-choix bg-clip-text">
            {themeName}
          </span>
        </nav>
      </div>

        {/* Bouton filtres mobile */}
        <button
          onClick={onToggleMobileFilters}
          className={`lg:hidden neo-button px-6 py-3 rounded-xl ml-auto font-medium transition-all duration-300 flex items-center gap-3 ${
            showMobileFilters 
              ? 'bg-gradient-to-r from-btn-add to-btn-choix text-white border-transparent glow-effect' 
              : 'modern-card text-text-prim border border-border-color hover:border-btn-add hover:glow-effect'
          }`}
        >
          <FontAwesomeIcon 
            icon={showMobileFilters ? faXmark : faBars} 
            className="w-4 h-4" 
          />
          Filtres
        </button>

        {/* Compteur stylisé */}
        <div className="modern-card px-4 py-3 rounded-xl border border-border-color inline-flex items-center gap-3">
          <div className="w-2 h-2 bg-btn-add rounded-full pulse-glow"></div>
          <span className="text-text-second font-medium">
            {displayText}
          </span>
        </div>
      </div>

      {/* Ligne de séparation avec gradient */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border-color to-transparent"></div>
    </div>
  )
}
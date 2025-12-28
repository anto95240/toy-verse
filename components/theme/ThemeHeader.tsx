import React from "react"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faFilter, faBoxOpen, faStar } from "@fortawesome/free-solid-svg-icons"
import ViewToggle from "@/components/toyGrid/ViewToggle"

interface ThemeHeaderProps {
  themeName: string
  filteredToysCount: number
  totalToysCount: number
  showMobileFilters: boolean
  onToggleMobileFilters: () => void
  // Nouveaux props pour intégrer le Switch et la Pagination
  view: 'collection' | 'wishlist'
  onViewChange: (view: 'collection' | 'wishlist') => void
  children?: React.ReactNode // Pour insérer la pagination ou autre
}

export default function ThemeHeader({
  themeName,
  filteredToysCount,
  totalToysCount,
  showMobileFilters,
  onToggleMobileFilters,
  view,
  onViewChange,
  children
}: ThemeHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Ligne du haut : Retour + Titre + Stats + Bouton Filtre (Mobile) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* BLOC GAUCHE : Retour + Titre */}
        <div className="flex items-center gap-3">
          <Link 
            href="/home"
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>

          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
              <Link href="/home" className="hover:text-primary transition-colors">Accueil</Link>
              <span>/</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground font-title leading-tight">
              {themeName}
            </h1>
          </div>
        </div>

        {/* BLOC DROIT (Mobile) : Filtre */}
        <button
          onClick={onToggleMobileFilters}
          className={`lg:hidden p-2.5 rounded-lg border transition-colors ${
            showMobileFilters 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'bg-card text-muted-foreground border-border hover:border-primary'
          }`}
        >
          <FontAwesomeIcon icon={faFilter} />
        </button>
      </div>

      {/* Ligne du bas : Contrôles (Switch + Stats + Pagination) */}
      <div className="bg-card border border-border rounded-xl p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Switch Collection / Wishlist */}
        <div className="w-full md:w-auto">
          <ViewToggle view={view} setView={onViewChange} isHeader />
        </div>

        {/* Stats + Pagination */}
        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          {/* Badge Compteur */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg border border-border text-sm font-medium text-foreground whitespace-nowrap">
            <span className={view === 'collection' ? 'text-primary' : 'text-purple-500'}>
              <FontAwesomeIcon icon={view === 'collection' ? faBoxOpen : faStar} className="mr-2" />
              {filteredToysCount}
            </span>
            <span className="text-muted-foreground">/ {totalToysCount}</span>
          </div>

          {/* Espace pour la Pagination (injectée depuis le parent) */}
          <div className="hidden sm:block">
             {children}
          </div>
        </div>
        
        {/* Pagination Mobile (visible seulement si présente) */}
        <div className="sm:hidden w-full flex justify-center border-t border-border pt-3">
            {children}
        </div>
      </div>
    </div>
  )
}
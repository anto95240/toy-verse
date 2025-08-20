"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSlug } from "@/lib/slugUtils"
import Navbar from "@/components/Navbar"
import ThemesList from "@/components/ThemeList"
import type { Theme } from "@/types/theme"
import type { Toy } from "@/types/theme"

interface HomePageClientProps {
  initialThemes: Theme[]
  userId: string
  prenom: string
}

export default function HomePageClient({ initialThemes, userId, prenom }: HomePageClientProps) {
  const router = useRouter()
  const [searchResults, setSearchResults] = useState<(Toy & { theme_name: string })[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearchResults = (results: (Toy & { theme_name: string })[]) => {
    setSearchResults(results)
    setIsSearching(results.length > 0)
  }

  const handleToyClick = (toy: Toy & { theme_name: string }) => {
    const themeSlug = createSlug(toy.theme_name)
    router.push(`/${themeSlug}?search=${encodeURIComponent(toy.nom)}`)
  }

  const handleThemeClick = (theme: Theme) => {
    // Générer le slug depuis le nom du thème
    const slug = createSlug(theme.name)
    router.push(`/${slug}`)
  }

  return (
    <>
      <Navbar 
        prenom={prenom}
        onSearchResults={handleSearchResults}
        isGlobal={true}
      />
      <div className="relative min-h-screen bg-gradient-to-br from-bg-primary via-bg-primary to-bg-second">
        {/* Effet de background animé */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-btn-add opacity-10 rounded-full blur-3xl floating-animation"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-btn-choix opacity-10 rounded-full blur-3xl floating-animation" style={{animationDelay: '3s'}}></div>
        </div>

        <main className="relative z-10 p-8 min-h-[70vh]">
          {isSearching ? (
            <div className="slide-in-right">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-text-prim mb-2 bg-gradient-to-r from-btn-add to-btn-choix bg-clip-text">
                  Résultats de recherche
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-btn-add to-btn-choix mx-auto rounded-full glow-effect"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.map((toy) => (
                  <div
                    key={toy.id}
                    onClick={() => handleToyClick(toy)}
                    className="modern-card neo-button cursor-pointer p-6 rounded-xl group hover:scale-105 transition-all duration-300"
                  >
                    <div className="font-bold text-text-prim group-hover:text-btn-add transition-colors duration-300 text-lg">
                      {toy.nom}
                    </div>
                    <div className="text-sm text-text-second mt-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-btn-add rounded-full pulse-glow"></span>
                      {toy.theme_name}
                    </div>
                    <div className="text-sm text-text-second mt-2 px-3 py-1 bg-bg-second rounded-full inline-block border border-border-color">
                      {toy.categorie || "Sans catégorie"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-text-prim mb-4 bg-gradient-to-r from-btn-add to-btn-choix bg-clip-text">
                  Vos Thèmes
                </h1>
                <p className="text-text-second text-lg max-w-2xl mx-auto">
                  Explorez votre collection et découvrez vos univers favoris
                </p>
                <div className="w-32 h-1 bg-gradient-to-r from-btn-add to-btn-choix mx-auto rounded-full glow-effect mt-6"></div>
              </div>
              
              <div className="slide-in-right">
                <ThemesList 
                  initialThemes={initialThemes} 
                  userId={userId} 
                  onThemeClick={handleThemeClick}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

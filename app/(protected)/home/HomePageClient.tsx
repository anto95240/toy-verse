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
    // Utiliser le slug généré depuis le nom du thème
    const themeSlug = createSlug(toy.theme_name)
    router.push(`/${themeSlug}`)
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
      <main className="p-8 min-h-[70vh]">
        {isSearching ? (
          <div>
            <h1 className="text-2xl mb-6 text-center">Résultats de recherche</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((toy) => (
                <div
                  key={toy.id}
                  onClick={() => handleToyClick(toy)}
                  className="bg-bg-second border border-border-color rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="font-medium text-text-second">{toy.nom}</div>
                  <div className="text-sm text-text-second mt-1">
                    {toy.theme_name}
                  </div>
                  <div className="text-sm text-text-second mt-1">
                    {toy.categorie || "Sans catégorie"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl mb-6 text-center">Vos thèmes</h1>
            <ThemesList 
              initialThemes={initialThemes} 
              userId={userId} 
              onThemeClick={handleThemeClick}
            />
          </div>
        )}
      </main>
    </>
  )
}
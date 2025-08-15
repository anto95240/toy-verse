
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
    router.push(`/theme/${toy.theme_id}`)
  }

  return (
    <>
      <Navbar 
        prenom={prenom}
        onSearchResults={handleSearchResults}
      />
      <main className="main-content p-8 min-h-[70vh]">
        {isSearching ? (
          <div>
            <h1 className="text-2xl mb-6 text-center">Résultats de recherche</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((toy) => (
                <div
                  key={toy.id}
                  onClick={() => handleToyClick(toy)}
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="font-medium text-gray-900">{toy.nom}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {toy.theme_name}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {toy.categorie || "Sans catégorie"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl mb-6 text-center">Vos thèmes</h1>
            <ThemesList initialThemes={initialThemes} userId={userId} />
          </div>
        )}
      </main>
    </>
  )
}
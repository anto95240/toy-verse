'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons'

interface ThemeHeaderProps {
  themeName: string
  filteredToysCount: number
  showMobileFilters: boolean
  onToggleMobileFilters: () => void
}

export default function ThemeHeader({
  themeName,
  filteredToysCount,
  showMobileFilters,
  onToggleMobileFilters
}: ThemeHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <button
        onClick={() => router.push('/home')}
        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2 w-fit"
      >
        ← Retour aux thèmes
      </button>

      {/* Bouton filtres mobile */}
      <button
        onClick={onToggleMobileFilters}
        className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <FontAwesomeIcon icon={showMobileFilters ? faXmark : faBars} />
        Filtres
      </button>

      {/* Fil d'Ariane */}
      <nav className="text-sm text-gray-600 mb-4" aria-label="breadcrumb">
        <ol className="list-none p-0 inline-flex flex-wrap">
          <li className="flex items-center">
            <button onClick={() => router.push('/home')} className="hover:underline">
              Home
            </button>
            <span className="mx-2"> &gt; </span>
          </li>
          <li className="flex items-center text-gray-800 font-semibold">
            {themeName}
          </li>
        </ol>
        <span className="ml-0 sm:ml-4 block sm:inline text-gray-500">
          (Total jouets : {filteredToysCount})
        </span>
      </nav>
    </div>
  )
}